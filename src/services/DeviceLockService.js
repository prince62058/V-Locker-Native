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
    let imei = '';
    try {
      imei = await KioskModule.getDeviceImei();
    } catch (e) {
      console.warn('Failed to fetch real IMEI, falling back to Android ID:', e);
      imei = await DeviceInfo.getUniqueId();
    }
    console.log('Checking Lock Status for ID (Public):', imei);

    // FOR DEBUGGING ONLY: Remove hardcoded IMEI
    // imei = '867400022047199';
    // console.log(`[DEBUG] FORCED Emulator IMEI to: ${imei}`);

    // 2. Initial Offline Check (Fast Lock)
    // If we haven't checked yet (e.g. app just started), verify local storage first
    // This protects against "Restart -> No Internet" evasion
    const localStatus = await AsyncStorage.getItem(LOCK_STATUS_KEY);
    console.log('Local stored lock status:', localStatus);

    if (localStatus === 'LOCKED') {
      // Enforce lock immediately before network call
      await KioskModule.enableKioskMode();
      try {
        await KioskModule.bringAppToFront();
      } catch (e) {}
      DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'LOCKED' }); // Emit event
    }

    // 3. Network Check
    // Using a direct fetch for maximum robustness independent of app state
    const API_URL = 'https://vlockerbackend.onrender.com/api';

    // We add a timestamp to avoid caching issues if any
    const response = await fetch(
      `${API_URL}/customerLoan/status/public?imei=${imei}&t=${Date.now()}`,
    );
    const data = await response.json();

    console.log('Lock Status Response:', data);

    if (data?.success) {
      // 1. Handle Encryption/Lock Status
      if (data.status === 'LOCKED') {
        // Update Local State
        // Update Local State
        if (localStatus !== 'LOCKED') {
          await AsyncStorage.setItem(LOCK_STATUS_KEY, 'LOCKED');
        }
        console.log('Device should be LOCKED. Enabling Kiosk Mode...');
        await KioskModule.enableKioskMode();

        // Ensure app is visible - Always call this to prevent user from escaping
        try {
          await KioskModule.bringAppToFront();
        } catch (e) {
          console.log('Error bringing app to front:', e);
        }

        DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'LOCKED' }); // Emit event
      } else {
        // Explicitly UNLOCKED or fallback for no active loan/loan not approved
        // Update Local State
        if (localStatus !== 'UNLOCKED') {
          await AsyncStorage.setItem(LOCK_STATUS_KEY, 'UNLOCKED');
        }
        console.log('Device should be UNLOCKED. Disabling Kiosk Mode...');
        await KioskModule.disableKioskMode();
        DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'UNLOCKED' }); // Emit event
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

          // Developer Options - DISABLED ENFORCEMENT as requested
          // We want Developer Options to REMAIN ENABLED for now.
          // if (data.policy.hasOwnProperty('isDeveloperOptionsBlocked')) {
          //   const shouldBlock = data.policy.isDeveloperOptionsBlocked;
          //   await KioskModule.setDeveloperOptionsAllowed(!shouldBlock);
          // }

          // Force Enable Developer Options (Optional, but safe redundant check)
          await KioskModule.setDeveloperOptionsAllowed(true);
        } catch (policyError) {
          console.warn(
            'Device Policy Error (App might not be Device Owner or Activity Null):',
            policyError.message,
          );
        }
      }
    }
  } catch (error) {
    console.error('Error checking lock status:', error);
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
