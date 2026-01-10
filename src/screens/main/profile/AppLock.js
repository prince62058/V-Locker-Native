import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
  const [form, setForm] = useState({ bankName: '' });
  const [errors, setErrors] = useState({});

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

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (value?.length > 0) setErrors(prev => ({ ...prev, [key]: null }));
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
    console.log('PIN details data ---> ', pin);
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
            <MainText style={styles.titleText}>Create a TPin Password</MainText>
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
                />
              ))}
            </View>
          </View>
          <SubmitButton
            title="Set PIN"
            onPress={handleCreatePress}
            mainStyle={styles.button}
            loading={loading}
          />
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
