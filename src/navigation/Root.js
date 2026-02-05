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

      // Store user phone for DeviceLockService fallback
      if (user?.phone) {
        await setItem('vlocker_user_phone', user.phone);
        console.log('Root: Stored User Phone for Lock fallback:', user.phone);
        try {
          await KioskModule.setLoanPhone(user.phone);
          console.log('Root: Native KioskModule Loan Phone set successfully');
        } catch (phoneErr) {
          console.log('Root: Failed to set Native Loan Phone:', phoneErr);
        }
      }
    } catch (error) {
      console.log('Root: FCM Token sync failed', error);
    }
  };

  useEffect(() => {
    if (token) {
      handleFcmTokenSync();

      // Fetch and Store Real IMEI for this user/loan
      const fetchAndStoreLoanImei = async () => {
        try {
          console.log('Root: Fetching Loan IMEI for accurate locking...');
          const res = await getApi('/customerLoan/mobile/status');
          // console.log('Loan Status Response:', res);

          if (
            res?.success &&
            (res?.data?.imeiNumber1 || res?.data?.imeiNumber2)
          ) {
            const loanImei = res.data.imeiNumber1 || res.data.imeiNumber2;
            await setItem('vlocker_loan_imei', loanImei);
            console.log('Root: Stored Loan IMEI successfully:', loanImei);

            // Bridge to Native for LockService
            try {
              await KioskModule.setLoanImei(loanImei);
              console.log(
                'Root: Native KioskModule Loan IMEI set successfully',
              );
            } catch (kioskErr) {
              console.log('Root: Failed to set Native Loan IMEI:', kioskErr);
            }
          } else {
            // If no loan found, we can't do much, relying on fallback
            console.log('Root: No active loan or IMEI found for this user.');
          }
        } catch (error) {
          console.log('Root: Error fetching Loan IMEI:', error);
        }
      };

      fetchAndStoreLoanImei();
    }
  }, [token]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Tab');
  const [isLocked, setIsLocked] = useState(false);

  // Initialize Lock State from Storage immediately (Source of truth: Native)
  useEffect(() => {
    const initLockState = async () => {
      try {
        const nativeStatus = await KioskModule.getLockStatus();
        console.log('Root: Initial Native Lock Status sync:', nativeStatus);

        if (nativeStatus === 'LOCKED') {
          setIsLocked(true);
        } else {
          // Fallback check to AsyncStorage for redundant safety
          const storedStatus = await AsyncStorage.getItem(
            'vlocker_lock_status',
          );
          if (storedStatus === 'LOCKED') {
            setIsLocked(true);
          }
        }

        // Enable permanent protections (Factory Reset + Uninstall blocking)
        if (KioskModule.enablePermanentProtections) {
          try {
            await KioskModule.enablePermanentProtections();
            console.log('Root: Permanent protections enabled successfully');
          } catch (protErr) {
            console.log(
              'Root: Failed to enable permanent protections:',
              protErr,
            );
          }
        }
      } catch (e) {
        console.warn('Root: Failed to init lock state from native:', e);
      }
    };
    initLockState();
  }, []);

  // Polling for Remote Lock & Service Management
  useEffect(() => {
    // Start the robust Lock Service
    // Pass user role: 'admin' will STOP service, others will START it.
    DeviceLockService.startLockService(user?.role);

    // We do NOT stop the service on unmount generally, relying on the service's internal logic
    // to keep running unless explicitly stopped by admin login.
  }, [user?.role]);

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
          setInitialRoute('Tab');
        } else if (pin && initialRoute === 'Tab') {
          setInitialRoute('LockScreen');
        }
      } catch (e) {
        console.error(e);
      }
    };
    const interval = setInterval(checkPinOnFocus, 1000);
    return () => clearInterval(interval);
  }, [initialRoute]);

  // Listen for Instant Lock/Unlock Events & Screen OFF
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'LOCK_STATUS_CHANGED',
      async event => {
        console.log('ROOT_JS: Received LOCK_STATUS_CHANGED event:', event);
        if (event.status === 'LOCKED') {
          console.log('ROOT_JS: Setting isLocked = TRUE');
          setIsLocked(true);
          await AsyncStorage.setItem('vlocker_lock_status', 'LOCKED');
        } else if (event.status === 'UNLOCKED') {
          console.log('ROOT_JS: Setting isLocked = FALSE');
          setIsLocked(false);
          await AsyncStorage.setItem('vlocker_lock_status', 'UNLOCKED');
        }
      },
    );

    const screenOffSubscription = DeviceEventEmitter.addListener(
      'SCREEN_OFF',
      async () => {
        // Check if App Lock is enabled
        const pin = await AsyncStorage.getItem('APP_LOCK_PIN');
        const lockStatus = await AsyncStorage.getItem('vlocker_lock_status');
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
        const nativeStatus = await KioskModule.getLockStatus();
        console.log('Root: SCREEN_ON sync. Native Status:', nativeStatus);

        if (nativeStatus === 'LOCKED') {
          setIsLocked(true);
          await AsyncStorage.setItem('vlocker_lock_status', 'LOCKED');
          try {
            await KioskModule.bringAppToFront();
          } catch (e) {}
        } else {
          setIsLocked(false);
          await AsyncStorage.setItem('vlocker_lock_status', 'UNLOCKED');
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

  // FORCE RENDER LOCK SCREEN if locked
  if (isLocked) {
    return <DeviceLockScreen />;
  }

  return (
    <SafeAreaProvider>
      <MainView bottomSafe={true}>
        <GestureHandlerRootView style={styles.container}>
          <BottomSheetModalProvider>
            <NavigationContainer ref={navigationRef}>
              {token ? <Main initialRouteName={initialRoute} /> : <Auth />}
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
