import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Auth from './stack/Auth';
import Main from './stack/Main';

import MainView from '../components/MainView';
import { COLORS } from '../constants';
import { useSelector } from 'react-redux';

import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getApi } from '../services/axios/api';
import { NativeModules } from 'react-native';
const { KioskModule } = NativeModules;

const Root = () => {
  const { token, user } = useSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Tab');

  // Polling for Remote Lock
  useEffect(() => {
    let interval;
    const checkLockStatus = async () => {
      if (!token) return;

      try {
        // 1. Get all loans for this customer (assuming user._id is customerId)
        // Adjust endpoint if user is not customer but user.id matches customerId
        // The API /api/customerLoan/:customerId returns list of loans.
        // We will assume the FIRST active loan controls the device.
        const response = await getApi(`customerLoan`);
        const loans = response?.data?.data || [];
        // Sort by createdAt descending to get the latest loan
        const sortedLoans = loans.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        const activeLoan = sortedLoans[0];

        if (activeLoan) {
          console.log('Polling Lock Status:', activeLoan.deviceUnlockStatus);

          if (activeLoan.deviceUnlockStatus === 'LOCKED') {
            await AsyncStorage.setItem('DEVICE_LOCK_STATUS', 'LOCKED');
            console.log('Polling: LOCKING DEVICE NOW');
            KioskModule.enableKioskMode()
              .then(() => console.log('Kiosk Enabled Success'))
              .catch(e => console.log('Kiosk Enable Error', e));
          } else if (activeLoan.deviceUnlockStatus === 'UNLOCKED') {
            await AsyncStorage.setItem('DEVICE_LOCK_STATUS', 'UNLOCKED');
            console.log('Polling: UNLOCKING DEVICE NOW');
            KioskModule.disableKioskMode()
              .then(() => console.log('Kiosk Disable Success'))
              .catch(e => console.log('Kiosk Disable Error', e));
          }
        }
      } catch (error) {
        console.log('Polling Error:', error);
      }
    };

    // 2. Check local storage for offline lock enforcement
    const enforceLocalLock = async () => {
      try {
        const localStatus = await AsyncStorage.getItem('DEVICE_LOCK_STATUS');
        if (localStatus === 'LOCKED') {
          console.log('Local Enforce: LOCKING DEVICE NOW');
          KioskModule.enableKioskMode();
        }
      } catch (e) {
        console.log('Local Lock Error', e);
      }
    };

    if (token) {
      // Run immediately
      enforceLocalLock();
      checkLockStatus();
      // Poll every 5 seconds
      interval = setInterval(checkLockStatus, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [token, user]);

  useEffect(() => {
    const checkPin = async () => {
      try {
        const pin = await AsyncStorage.getItem('APP_LOCK_PIN');
        if (pin) {
          setInitialRoute('LockScreen');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkPin();
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

  return (
    <SafeAreaProvider>
      <MainView bottomSafe={true}>
        <GestureHandlerRootView style={styles.container}>
          <BottomSheetModalProvider>
            <NavigationContainer>
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
