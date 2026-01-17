import { getApp } from '@react-native-firebase/app';
import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { createNotification } from '../notifee/notifee';
import notificationPermission from '../permissions/notificationPermission';

const app = getApp();
const messagingInstance = getMessaging(app);

export async function getFcmToken() {
  try {
    const hasPermission = await notificationPermission();
    if (!hasPermission) return null;
    return await getToken(messagingInstance);
  } catch {
    return null;
  }
}

import { DeviceEventEmitter } from 'react-native';

export const foregroundMessage = () => {
  onMessage(messagingInstance, async message => {
    console.log('Foreground Message', message);

    // Handle Remote Lock/Unlock in Foreground
    if (message?.data?.type === 'LOCK') {
      await AsyncStorage.setItem('DEVICE_LOCK_STATUS', 'LOCKED');
      KioskModule.enableKioskMode();
      DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'LOCKED' });
      console.log('Foreground: Device Locked via FCM');
    } else if (message?.data?.type === 'UNLOCK') {
      await AsyncStorage.setItem('DEVICE_LOCK_STATUS', 'UNLOCKED');
      KioskModule.disableKioskMode();
      DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'UNLOCKED' });
      console.log('Foreground: Device Unlocked via FCM');
    } else if (message?.data?.type === 'LOAN_UPDATE') {
      DeviceEventEmitter.emit('LOAN_UPDATE', { message });
      console.log('Foreground: Loan Updated via FCM');
    }

    if (message) {
      await createNotification(message);
    }
  });
};

import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { KioskModule } = NativeModules;

export const backgroundMessageHandler = () => {
  setBackgroundMessageHandler(messagingInstance, async message => {
    console.log('Background Message', message);

    // Handle Remote Lock/Unlock
    if (message?.data?.type === 'LOCK') {
      await AsyncStorage.setItem('DEVICE_LOCK_STATUS', 'LOCKED');
      KioskModule.bringAppToFront(); // Ensure app comes to front to show Red Screen
      KioskModule.enableKioskMode();
      DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'LOCKED' }); // Helpful if app was suspended but JS still runs
      console.log('Background: Device Locked via FCM');
    } else if (message?.data?.type === 'UNLOCK') {
      await AsyncStorage.setItem('DEVICE_LOCK_STATUS', 'UNLOCKED');
      KioskModule.disableKioskMode();
      DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'UNLOCKED' });
      console.log('Background: Device Unlocked via FCM');
    } else if (message?.data?.type === 'LOAN_UPDATE') {
      DeviceEventEmitter.emit('LOAN_UPDATE', { message });
      console.log('Background: Loan Updated via FCM');
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
