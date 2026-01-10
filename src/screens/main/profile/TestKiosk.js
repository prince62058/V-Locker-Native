import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  NativeModules,
  Alert,
  BackHandler,
} from 'react-native';
import MainView from '../../../components/MainView';
import CustomHeader from '../../../components/header/CustomHeader';
import MainText from '../../../components/MainText';
import SubmitButton from '../../../components/common/button/SubmitButton';
import { COLORS, FONTS, SIZES } from '../../../constants';

const { KioskModule } = NativeModules;

const TestKiosk = ({ navigation }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [status, setStatus] = useState('Unlocked');

  useEffect(() => {
    // Prevent back button if locked
    const backAction = () => {
      // In real app, you would check if lockedstate is true
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const checkOwner = async () => {
    try {
      const isOwner = await KioskModule.isDeviceOwner();
      Alert.alert(
        'Device Owner Status',
        isOwner
          ? 'YES, Is Device Owner'
          : 'NO, Not Device Owner. Run adb shell dpm set-device-owner...',
      );
    } catch (e) {
      console.error(e);
      Alert.alert('Error', e.message);
    }
  };

  const handleLock = async () => {
    try {
      await KioskModule.enableKioskMode();
      setIsLocked(true);
      setStatus('LOCKED (Kiosk Mode Active)');
    } catch (e) {
      console.error(e);
      Alert.alert('Lock Error', e.message);
    }
  };

  const handleUnlock = async () => {
    try {
      await KioskModule.disableKioskMode();
      setIsLocked(false);
      setStatus('Unlocked');
    } catch (e) {
      console.error(e);
      Alert.alert('Unlock Error', e.message);
    }
  };

  return (
    <MainView transparent={false}>
      <CustomHeader title="Test Kiosk Mode" back />
      <View style={styles.container}>
        <MainText style={styles.statusText}>Status: {status}</MainText>

        <SubmitButton
          title="Check Device Owner Permission"
          onPress={checkOwner}
          mainStyle={styles.button}
        />

        <SubmitButton
          title="LOCK DEVICE (Enable Kiosk)"
          onPress={handleLock}
          mainStyle={[styles.button, { backgroundColor: COLORS.red }]}
        />

        <SubmitButton
          title="UNLOCK DEVICE (Disable Kiosk)"
          onPress={handleUnlock}
          mainStyle={[styles.button, { backgroundColor: COLORS.green }]}
        />

        <MainText style={styles.info}>
          Note: For Lock to work, you must run this ADB command once:
        </MainText>
        <MainText style={styles.code}>
          adb shell dpm set-device-owner com.vlocker/.MyDeviceAdminReceiver
        </MainText>
      </View>
    </MainView>
  );
};

export default TestKiosk;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SIZES.width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    color: COLORS.white,
    fontFamily: FONTS.bold,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    marginBottom: 20,
    width: '100%',
  },
  info: {
    marginTop: 40,
    color: COLORS.borderLight,
    textAlign: 'center',
    fontSize: 12,
  },
  code: {
    marginTop: 10,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    fontSize: 12,
    backgroundColor: '#111',
    padding: 10,
    padding: 10,
    borderRadius: 5,
  },
});
