import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Auth from './stack/Auth';
import Main from './stack/Main';

import MainView from '../components/MainView';
import { COLORS } from '../constants';
import { useSelector, useDispatch } from 'react-redux';
import { NativeModules, DeviceEventEmitter } from 'react-native';

import { saveFCMThunk } from '../redux/slices/auth/authSlice';
import { getFcmToken } from '../services/firebase/notification';
import { ASYNC_DATA } from '../constants/constants';
import { getItem, setItem } from '../services/storage/asyncStorage';

const { KioskModule } = NativeModules;

import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getApi } from '../services/axios/api';
import DeviceLockScreen from '../screens/DeviceLockScreen';
import DeviceLockService from '../services/DeviceLockService'; // Import Service

// Export navigation ref
export const navigationRef = createNavigationContainerRef();

const Root = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector(state => state.auth);

  // Sync FCM Token
  const handleFcmTokenSync = async () => {
    if (!token) return;
    try {
      const fcmToken = await getFcmToken();
      if (!fcmToken) return;

      const savedToken = await getItem(ASYNC_DATA.FCM_TOKEN);
      // FORCE SYNC: Commenting out optimization because backend was wiped
      // if (savedToken === fcmToken) return;

      console.log('Root: Syncing FCM Token...');
      const response = await dispatch(
        saveFCMThunk({ pushNotificationToken: fcmToken }),
      );

      if (saveFCMThunk.fulfilled.match(response)) {
        console.log('Root: FCM Token synced successfully.');
        await setItem(ASYNC_DATA.FCM_TOKEN, fcmToken);
      }
    } catch (error) {
      console.log('Root: FCM Token sync failed', error);
    }
  };

  useEffect(() => {
    if (token) {
      handleFcmTokenSync();
    }
  }, [token]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Tab');
  const [isLocked, setIsLocked] = useState(false);

  // Initialize Lock State from Storage immediately
  useEffect(() => {
    const initLockState = async () => {
      const storedStatus = await AsyncStorage.getItem('vlocker_lock_status');
      if (storedStatus === 'LOCKED') {
        setIsLocked(true);
      }
    };
    initLockState();
  }, []);

  // Polling for Remote Lock
  useEffect(() => {
    // Start the robust Lock Service
    DeviceLockService.startLockService(user?.role);

    return () => {
      DeviceLockService.stopLockService();
    };
  }, [user?.role]); // Run on mount and when role changes

  useEffect(() => {
    const checkPin = async () => {
      try {
        const pin = await AsyncStorage.getItem('APP_LOCK_PIN');
        if (pin) {
          setInitialRoute('LockScreen');
        } else {
          setInitialRoute('Tab');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkPin();
  }, []);

  // Re-check PIN when app comes to foreground
  useEffect(() => {
    const checkPinOnFocus = async () => {
      try {
        const pin = await AsyncStorage.getItem('APP_LOCK_PIN');
        if (!pin && initialRoute === 'LockScreen') {
          // PIN was removed, update route
          setInitialRoute('Tab');
        } else if (pin && initialRoute === 'Tab') {
          // PIN was added, update route
          setInitialRoute('LockScreen');
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Check periodically or on navigation events
    const interval = setInterval(checkPinOnFocus, 1000);
    return () => clearInterval(interval);
  }, [initialRoute]);

  // Listen for Instant Lock/Unlock Events & Screen OFF
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'LOCK_STATUS_CHANGED',
      async event => {
        console.log('Event Emitter: Received LOCK_STATUS_CHANGED', event);
        if (event.status === 'LOCKED') {
          setIsLocked(true);
          await AsyncStorage.setItem('vlocker_lock_status', 'LOCKED');
        } else if (event.status === 'UNLOCKED') {
          setIsLocked(false);
          await AsyncStorage.setItem('vlocker_lock_status', 'UNLOCKED');
        }
      },
    );

    const screenOffSubscription = DeviceEventEmitter.addListener(
      'SCREEN_OFF',
      async () => {
        console.log('Event Emitter: Received SCREEN_OFF');
        // Check if App Lock is enabled
        const pin = await AsyncStorage.getItem('APP_LOCK_PIN');
        const lockStatus = await AsyncStorage.getItem('vlocker_lock_status');

        // Only navigate to Lock Screen if Device is NOT already remotely locked
        if (pin && lockStatus !== 'LOCKED') {
          if (navigationRef.isReady()) {
            navigationRef.navigate('LockScreen');
          }
        }
      },
    );

    const screenOnSubscription = DeviceEventEmitter.addListener(
      'SCREEN_ON',
      async () => {
        console.log('Event Emitter: Received SCREEN_ON');
        const lockStatus = await AsyncStorage.getItem('vlocker_lock_status');
        if (lockStatus === 'LOCKED') {
          console.log('Screen ON & Locked -> Bringing to Front');
          setIsLocked(true); // Ensure state updates
          try {
            await KioskModule.bringAppToFront();
          } catch (e) {
            console.log('Error bringAppToFront:', e);
          }
        }
      },
    );

    return () => {
      subscription.remove();
      screenOffSubscription.remove();
      screenOnSubscription.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.black,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // FORCE RENDER LOCK SCREEN
  if (isLocked) {
    return <DeviceLockScreen />;
  }

  return (
    <SafeAreaProvider>
      <MainView bottomSafe={true}>
        <GestureHandlerRootView style={styles.container}>
          <BottomSheetModalProvider>
            <NavigationContainer ref={navigationRef}>
              {token && user?.isProfileCompleted ? (
                <Main initialRouteName={initialRoute} />
              ) : (
                <Auth />
              )}
            </NavigationContainer>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </MainView>
    </SafeAreaProvider>
  );
};

export default Root;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
});
