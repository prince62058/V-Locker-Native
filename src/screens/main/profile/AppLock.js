import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import SubmitButton from '../../../components/common/button/SubmitButton';
import CustomHeader from '../../../components/header/CustomHeader';
import MainText from '../../../components/MainText';
import MainView from '../../../components/MainView';
import { COLORS, FONTS, SIZES } from '../../../constants';
import { fontSize } from '../../../utils/fontSize';
import { showToast } from '../../../utils/ToastAndroid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppLock = ({ navigation }) => {
  const dispatch = useDispatch();
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [hasPIN, setHasPIN] = useState(false);
  const [updateStep, setUpdateStep] = useState(null); // null, 'verify', 'new'
  const [storedPin, setStoredPin] = useState('');

  // Check if PIN exists on mount
  useEffect(() => {
    checkPINExists();
  }, []);

  const checkPINExists = async () => {
    try {
      const pin = await AsyncStorage.getItem('APP_LOCK_PIN');
      if (pin) {
        setHasPIN(true);
        setStoredPin(pin);
      } else {
        setHasPIN(false);
      }
    } catch (error) {
      console.error('Error checking PIN:', error);
    }
  };

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

  const validate = () => {
    const result = otp.join('');

    if (result.trim() === '') {
      showToast('PIN is required');
      return false;
    }
    if (result.trim().length < 4) {
      showToast('PIN should be 4 digit');
      return false;
    }
    return true;
  };

  const handleCreatePress = async () => {
    if (!validate()) return;
    setLoading(true);
    const pin = otp.join('');
    try {
      await AsyncStorage.setItem('APP_LOCK_PIN', pin);
      setLoading(false);
      showToast('App lock password created successfully');
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      console.error('Error saving PIN:', error);
      showToast('Failed to save PIN');
    }
  };

  const handleUpdatePress = async () => {
    if (!validate()) return;

    const pin = otp.join('');

    // Step 1: Verify old PIN
    if (updateStep === null || updateStep === 'verify') {
      if (pin !== storedPin) {
        showToast('Incorrect current PIN');
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }
      // Old PIN verified, move to new PIN step
      setUpdateStep('new');
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }

    // Step 2: Set new PIN
    if (updateStep === 'new') {
      setLoading(true);
      try {
        await AsyncStorage.setItem('APP_LOCK_PIN', pin);
        setLoading(false);
        showToast('App lock password updated successfully');
        navigation.goBack();
      } catch (error) {
        setLoading(false);
        console.error('Error updating PIN:', error);
        showToast('Failed to update PIN');
      }
    }
  };

  const handleDisablePress = async () => {
    if (!validate()) return;

    const pin = otp.join('');

    // Verify PIN before disabling
    if (pin !== storedPin) {
      showToast('Incorrect PIN');
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.removeItem('APP_LOCK_PIN');
      setLoading(false);
      showToast('App lock removed successfully');
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      console.error('Error removing PIN:', error);
      showToast('Failed to remove PIN');
    }
  };

  const startUpdateFlow = () => {
    setUpdateStep('verify');
    setOtp(['', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const startDisableFlow = () => {
    setUpdateStep('disable');
    setOtp(['', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const getTitle = () => {
    if (!hasPIN) return 'Create a TPin Password';
    if (updateStep === 'verify') return 'Enter Current PIN';
    if (updateStep === 'new') return 'Enter New PIN';
    if (updateStep === 'disable') return 'Enter PIN to Remove Lock';
    return 'App Lock Options';
  };

  const getButtonTitle = () => {
    if (!hasPIN) return 'Set PIN';
    if (updateStep === 'verify') return 'Verify';
    if (updateStep === 'new') return 'Update PIN';
    if (updateStep === 'disable') return 'Remove Lock';
    return 'Continue';
  };

  const handleMainAction = () => {
    if (!hasPIN) {
      handleCreatePress();
    } else if (updateStep === 'disable') {
      handleDisablePress();
    } else {
      handleUpdatePress();
    }
  };

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
      <CustomHeader title="App Lock" back />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <MainText style={styles.titleText}>{getTitle()}</MainText>

            {/* Show options when PIN exists and no flow started */}
            {hasPIN && updateStep === null ? (
              <View style={styles.optionsContainer}>
                <Pressable
                  style={styles.optionButton}
                  onPress={startUpdateFlow}
                >
                  <MainText style={styles.optionText}>Update PIN</MainText>
                </Pressable>
                <Pressable
                  style={[styles.optionButton, styles.disableButton]}
                  onPress={startDisableFlow}
                >
                  <MainText style={[styles.optionText, styles.disableText]}>
                    Remove Lock
                  </MainText>
                </Pressable>
              </View>
            ) : (
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
                    textAlign="center"
                    selectTextOnFocus
                    secureTextEntry
                  />
                ))}
              </View>
            )}
          </View>

          {/* Only show button when in a flow */}
          {(!hasPIN || updateStep !== null) && (
            <SubmitButton
              title={getButtonTitle()}
              onPress={handleMainAction}
              mainStyle={styles.button}
              loading={loading}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </MainView>
  );
};

export default AppLock;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    marginHorizontal: SIZES.width * 0.05,
  },
  titleText: {
    fontSize: fontSize(25),
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: SIZES.height * 0.04,
    gap: SIZES.height * 0.02,
  },
  optionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.height * 0.02,
    paddingHorizontal: SIZES.width * 0.05,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.white}30`,
  },
  disableButton: {
    backgroundColor: `${COLORS.red}20`,
    borderColor: `${COLORS.red}50`,
  },
  optionText: {
    fontSize: fontSize(18),
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  disableText: {
    color: COLORS.red,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SIZES.width * 0.12,
    marginTop: SIZES.height * 0.04,
  },
  otpInput: {
    width: SIZES.width * 0.15,
    height: SIZES.width * 0.15,
    textAlign: 'center',
    fontSize: fontSize(18),
    color: COLORS.white,
    fontFamily: FONTS.medium,
    borderWidth: 1,
    borderColor: `${COLORS.white}90`,
    borderRadius: 10,
  },
  button: {
    marginBottom: SIZES.height * 0.01,
    marginHorizontal: 'auto',
  },
});
