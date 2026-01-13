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
import { NativeModules } from 'react-native';

const { KioskModule } = NativeModules;

import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getApi } from '../services/axios/api';
import DeviceLockScreen from '../screens/DeviceLockScreen';

const Root = () => {
  const { token, user } = useSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Tab');
  const [isLocked, setIsLocked] = useState(false);

  // Polling for Remote Lock
  useEffect(() => {
    let interval;
    const checkLockStatus = async () => {
      if (!token) return;

      try {
        // 1. Get status from new Mobile-specific endpoint
        const response = await getApi(`customerLoan/mobile/status`);
        const activeLoan = response?.data?.data;

        console.log(
          'Mobile Status Resp:',
          activeLoan ? activeLoan.deviceUnlockStatus : 'No Loan',
        );

        if (activeLoan) {
          if (activeLoan.deviceUnlockStatus === 'LOCKED') {
            await AsyncStorage.setItem('DEVICE_LOCK_STATUS', 'LOCKED');
            setIsLocked(true);
            console.log('Polling: LOCKING DEVICE NOW');
            KioskModule.enableKioskMode()
              .then(() => console.log('Kiosk Enabled Success'))
              .catch(e => console.log('Kiosk Enable Error', e));
          } else if (activeLoan.deviceUnlockStatus === 'UNLOCKED') {
            await AsyncStorage.setItem('DEVICE_LOCK_STATUS', 'UNLOCKED');
            setIsLocked(false);
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
          setIsLocked(true);
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
      // Poll every 2 seconds for faster feedback
      interval = setInterval(checkLockStatus, 2000);
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

  // FORCE RENDER LOCK SCREEN
  if (isLocked) {
    return <DeviceLockScreen />;
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
