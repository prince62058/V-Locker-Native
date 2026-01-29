import { NativeModules, Platform, DeviceEventEmitter } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getApi } from './axios/api';

const { KioskModule } = NativeModules;

const LOCK_STATUS_KEY = 'vlocker_lock_status';

const checkLockStatus = async () => {
  try {
    // 1. Get Device ID
    // 1. Get Device ID
    let imei = await AsyncStorage.getItem('vlocker_loan_imei');

    if (!imei) {
      console.log('No stored Loan IMEI found. Falling back to native check.');
      try {
        imei = await KioskModule.getDeviceImei();
      } catch (e) {
        console.warn(
          'Failed to fetch real IMEI, falling back to Android ID:',
          e,
        );
        imei = await DeviceInfo.getUniqueId();
      }
    }

    console.log('Checking Lock Status for ID:', imei);

    // 2. Initial Offline Check (Fast Lock)
    // Always use Native status as the absolute source of truth
    const nativeStatus = await KioskModule.getLockStatus();
    const localStatus = await AsyncStorage.getItem(LOCK_STATUS_KEY);
    console.log(
      'Native stored lock status:',
      nativeStatus,
      'Local:',
      localStatus,
    );

    if (nativeStatus === 'LOCKED') {
      // Sync AsyncStorage just in case
      await AsyncStorage.setItem(LOCK_STATUS_KEY, 'LOCKED');
      // Enforce lock immediately before network call
      await KioskModule.enableKioskMode();
      try {
        await KioskModule.bringAppToFront();
      } catch (e) {}
      DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'LOCKED' }); // Emit event
    } else {
      // If native says UNLOCKED but JS thought LOCKED, sync it
      if (localStatus === 'LOCKED' && nativeStatus === 'UNLOCKED') {
        await AsyncStorage.setItem(LOCK_STATUS_KEY, 'UNLOCKED');
        DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'UNLOCKED' });
      }
    }

    // 3. Network Check
    // Using a direct fetch for maximum robustness independent of app state
    const API_URL = 'https://v-locker.framekarts.com/api';
    const userPhone = await AsyncStorage.getItem('vlocker_user_phone');

    // We add a timestamp to avoid caching issues if any
    let url = `${API_URL}/customerLoan/status/public?imei=${imei}&t=${Date.now()}`;
    if (userPhone) {
      url += `&phone=${userPhone}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    console.log('Lock Status Response:', data);

    if (data?.success) {
      console.log('DEVICE_LOCK_SERVICE: API Success. Status:', data.status);
      // 1. Handle Encryption/Lock Status
      if (data.status === 'LOCKED') {
        // Update Local State
        console.log('DEVICE_LOCK_SERVICE: Status is LOCKED.');

        // Only call enableKioskMode if we weren't already locked
        const currentNative = await KioskModule.getLockStatus();
        if (currentNative !== 'LOCKED') {
          await AsyncStorage.setItem(LOCK_STATUS_KEY, 'LOCKED');
          console.log('DEVICE_LOCK_SERVICE: Enabling Kiosk Mode...');
          await KioskModule.enableKioskMode();
        } else {
          // Already locked, do nothing to prevent loop
          // await KioskModule.bringAppToFront();
        }

        // try {
        //   await KioskModule.bringAppToFront();
        // } catch (e) {
        //   console.log('Error bringing app to front:', e);
        // }

        DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'LOCKED' }); // Emit event
      } else if (data.status === 'UNLOCKED') {
        // Explicitly UNLOCKED
        // Update Local State
        console.log('DEVICE_LOCK_SERVICE: Status is UNLOCKED.');
        if (localStatus !== 'UNLOCKED') {
          await AsyncStorage.setItem(LOCK_STATUS_KEY, 'UNLOCKED');
        }
        await KioskModule.disableKioskMode();
        DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'UNLOCKED' }); // Emit event
      } else {
        console.log(
          'DEVICE_LOCK_SERVICE: Status is unknown/inactive:',
          data.status,
        );
      }

      // 2. Handle Policies (Reset & Uninstall)
      if (data.policy) {
        const {
          isResetAllowed,
          isUninstallAllowed,
          isWallpaperEnabled,
          wallpaperUrl,
        } = data.policy;
        console.log(
          `Applying Policies - Reset: ${isResetAllowed}, Uninstall: ${isUninstallAllowed}, Wallpaper: ${isWallpaperEnabled}`,
        );

        try {
          await KioskModule.setFactoryResetAllowed(!!isResetAllowed);
          await KioskModule.setUninstallAllowed(!!isUninstallAllowed);

          // Handle Wallpaper Policy immediately if KioskModule supports it
          if (KioskModule.updateWallpaper) {
            await KioskModule.updateWallpaper(
              !!isWallpaperEnabled,
              wallpaperUrl || '',
            );
          }

          // Developer Options - Policy Driven Control
          if (data.policy.hasOwnProperty('isDeveloperOptionsBlocked')) {
            const shouldBlock = data.policy.isDeveloperOptionsBlocked;
            await KioskModule.setDeveloperOptionsAllowed(!shouldBlock);
          }

          // Handle App Blocks (WhatsApp, YouTube, etc.)
          const appBlocks = [
            { key: 'isWhatsAppBlocked', package: 'com.whatsapp' },
            { key: 'isInstagramBlocked', package: 'com.instagram.android' },
            { key: 'isSnapchatBlocked', package: 'com.snapchat.android' },
            { key: 'isYouTubeBlocked', package: 'com.google.android.youtube' },
            { key: 'isFacebookBlocked', package: 'com.facebook.katana' },
            { key: 'isDialerBlocked', package: 'com.google.android.dialer' }, // Standard Google Dialer
            {
              key: 'isMessagesBlocked',
              package: 'com.google.android.apps.messaging',
            }, // Google Messages
            { key: 'isPlayStoreBlocked', package: 'com.android.vending' },
            { key: 'isChromeBlocked', package: 'com.android.chrome' },
          ];

          for (const app of appBlocks) {
            if (data.policy.hasOwnProperty(app.key)) {
              await KioskModule.setApplicationHidden(
                app.package,
                !!data.policy[app.key],
              );
            }
          }
        } catch (policyError) {
          console.warn(
            'Device Policy Error (App might not be Device Owner or Activity Null):',
            policyError.message,
          );
        }
      }
    }
  } catch (error) {
    if (error?.message?.includes('Current activity is null')) {
      console.log(
        'Background lock check: Activity not yet available (App in bg)',
      );
    } else {
      console.warn('Background lock check status:', error?.message || error);
    }
    // If Network Error occurs, we rely on the Local Status check we did at the start of the function.
    // If local was LOCKED, we already called enableKioskMode().
    // So we are safe.
  }
};

// Polling interval in milliseconds (e.g., 5 minutes or 1 minute)
// For critical locking, 1 minute is good.
const POLLING_INTERVAL = 5 * 1000; // Reduced to 5 seconds for faster updates

let intervalId = null;

const startLockService = async userRole => {
  // 1. If Admin/Financer logs in, we MUST stop everything regardless of intervalId state
  if (userRole === 'admin' || userRole === 'financer') {
    console.log(
      'Admin/Financer logged in. Ensuring all lock services are STOPPED.',
    );
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    try {
      await KioskModule.stopBackgroundLockService();
      await KioskModule.disableKioskMode();
      await AsyncStorage.setItem(LOCK_STATUS_KEY, 'UNLOCKED');
      DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'UNLOCKED' });
    } catch (e) {
      console.warn('Error stopping services for admin bypass:', e);
    }
    return;
  }

  // 2. For non-admins, if service is already running, no need to restart
  if (intervalId) return;

  console.log('Starting Device Lock Service...');
  try {
    await KioskModule.startBackgroundLockService();
  } catch (e) {
    console.warn('Error starting native service:', e);
  }

  checkOverlayPermission(); // Ensure we have permissions for background popups
  checkLockStatus(); // Initial check
  intervalId = setInterval(checkLockStatus, POLLING_INTERVAL);
};

const checkOverlayPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const hasPermission = await KioskModule.hasOverlayPermission();
      if (!hasPermission) {
        console.log('Overlay permission missing. Requesting user...');
        // Open settings
        KioskModule.openOverlaySettings();
      } else {
        console.log('Overlay permission granted.');
      }
    }
  } catch (e) {
    console.error('Error checking overlay permission:', e);
  }
};

const stopLockService = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

export default {
  checkLockStatus,
  startLockService,
  stopLockService,
  checkOverlayPermission,
};
