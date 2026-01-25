import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Alert,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubmitButton from '../../components/common/button/SubmitButton';
import MainText from '../../components/MainText';
import MainView from '../../components/MainView';
import { COLORS, FONTS, SIZES } from '../../constants';
import {
  fontSize,
  scale,
  verticalScale,
  moderateScale,
} from '../../utils/responsive';

const LockScreen = ({ navigation }) => {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // Prevent going back
  useEffect(() => {
    const backAction = () => {
      // Exit app or do nothing, but don't let them go back to splash/other screens without unlocking
      // BackHandler.exitApp();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  const handleOtpChange = (value, index) => {
    if (/^\d$/.test(value) || value === '') {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);
      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const validatePin = async () => {
    const enteredPin = otp.join('');
    if (enteredPin.length < 4) return;

    setLoading(true);
    try {
      const storedPin = await AsyncStorage.getItem('APP_LOCK_PIN');
      if (enteredPin === storedPin) {
        // Success
        // Check if user is logged in (token exists) to decide where to go
        // For now, let's assume we go to Tab if unlocked.
        // However, Main.js/Splash.js logic usually handles this.
        // If this screen is pushed on top of everything, we might just need to goBack or reset to Main.
        // Better approach: Navigate to 'Tab' which is the main app.
        navigation.replace('Tab');
      } else {
        Alert.alert('Incorrect PIN', 'Please try again.');
        setOtp(['', '', '', '']);
        inputRefs.current[0].focus();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (otp.every(d => d !== '')) {
      validatePin();
    }
  }, [otp]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOffset(Platform.OS === 'android' ? 0 : 90);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(-40);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <MainView transparent={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <MainText style={styles.titleText}>Enter App Lock PIN</MainText>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={el => (inputRefs.current[index] = el)}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={value => handleOtpChange(value, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  secureTextEntry
                  textAlign="center"
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              ))}
            </View>
          </View>

          <MainText
            style={styles.forgotText}
            onPress={() =>
              Alert.alert(
                'Reset',
                'Please contact admin or clear app data to reset PIN.',
              )
            }
          >
            Forgot PIN?
          </MainText>
        </ScrollView>
      </KeyboardAvoidingView>
    </MainView>
  );
};

export default LockScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  container: {
    width: '100%',
    paddingHorizontal: scale(20),
    alignItems: 'center',
  },
  titleText: {
    fontSize: fontSize(25),
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    marginBottom: verticalScale(40),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  otpInput: {
    width: scale(60),
    height: scale(60),
    textAlign: 'center',
    fontSize: fontSize(24),
    color: COLORS.white,
    fontFamily: FONTS.bold,
    borderWidth: 1,
    borderColor: `${COLORS.white}90`,
    borderRadius: 10,
  },
  forgotText: {
    marginTop: verticalScale(30),
    color: COLORS.gray,
    textDecorationLine: 'underline',
  },
});
