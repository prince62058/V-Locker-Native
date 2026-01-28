import { getApp } from '@react-native-firebase/app';
import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { DeviceEventEmitter, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNotification } from '../notifee/notifee';
import notificationPermission from '../permissions/notificationPermission';
import DeviceLockService from '../DeviceLockService';

const app = getApp();
const messagingInstance = getMessaging(app);
const { KioskModule } = NativeModules;

export async function getFcmToken() {
  try {
    const hasPermission = await notificationPermission();
    if (!hasPermission) return null;
    return await getToken(messagingInstance);
  } catch {
    return null;
  }
}

export const foregroundMessage = () => {
  onMessage(messagingInstance, async message => {
    console.log('Foreground Message', message);

    // Handle Remote Lock/Unlock in Foreground
    if (message?.data?.type === 'LOCK') {
      await AsyncStorage.setItem('DEVICE_LOCK_STATUS', 'LOCKED');
      KioskModule.enableKioskMode();
      DeviceLockService.checkLockStatus();
      DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'LOCKED' });
      console.log('Foreground: Device Locked via FCM');
    } else if (message?.data?.type === 'UNLOCK') {
      await AsyncStorage.setItem('DEVICE_LOCK_STATUS', 'UNLOCKED');
      KioskModule.disableKioskMode();
      DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'UNLOCKED' });
      console.log('Foreground: Device Unlocked via FCM');
    } else if (
      message?.data?.type === 'LOAN_UPDATE' ||
      message?.data?.type === 'POLICY_UPDATE'
    ) {
      DeviceEventEmitter.emit('LOAN_UPDATE', { message });
      DeviceLockService.checkLockStatus();
      console.log(`Foreground: ${message?.data?.type} via FCM`);
    }

    if (message) {
      await createNotification(message);
    }
  });
};

export const backgroundMessageHandler = () => {
  setBackgroundMessageHandler(messagingInstance, async message => {
    console.log('Background Message', message);

    const { type, title, body } = message?.data || {};

    // Handle Remote Lock/Unlock
    if (type === 'LOCK') {
      await AsyncStorage.setItem('DEVICE_LOCK_STATUS', 'LOCKED');
      KioskModule.bringAppToFront()
        .then(() =>
          console.log('Background: App brought to front successfully'),
        )
        .catch(err =>
          console.error('Background: Failed to bring app to front', err),
        ); // Ensure app comes to front to show Red Screen
      KioskModule.enableKioskMode();
      DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'LOCKED' }); // Helpful if app was suspended but JS still runs
      console.log('Background: Device Locked via FCM');

      // Force Notification for Lock
      await createNotification(
        {
          ...message,
          data: {
            ...message.data,
            title: title || 'Device Locked',
            body: body || 'Your device has been locked.',
          },
        },
        true,
      ); // Enable Full Screen Intent
      return;
    } else if (type === 'UNLOCK') {
      await AsyncStorage.setItem('DEVICE_LOCK_STATUS', 'UNLOCKED');
      KioskModule.disableKioskMode();
      DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'UNLOCKED' });
      console.log('Background: Device Unlocked via FCM');

      // Force Notification for Unlock
      await createNotification({
        ...message,
        data: {
          ...message.data,
          title: title || 'Device Unlocked',
          body: body || 'Your device has been unlocked.',
        },
      });
      return;
    } else if (type === 'LOAN_UPDATE' || type === 'POLICY_UPDATE') {
      DeviceEventEmitter.emit('LOAN_UPDATE', { message });
      DeviceLockService.checkLockStatus();
      console.log(`Background: ${type} via FCM`);
    }

    if (message?.messageId) {
      await createNotification(message);
    }
  });
};

export const onNotificationOpened = () => {
  onNotificationOpenedApp(messagingInstance, remoteMessage => {
    console.log('Notification opened from background:', remoteMessage);
  });
};

export const onAppLaunchedFromQuit = async () => {
  const remoteMessage = await getInitialNotification(messagingInstance);
  console.log('Notification onAppOpenedFromQuit:', remoteMessage);
};
