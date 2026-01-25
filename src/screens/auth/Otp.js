import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from 'react-native';
import React from 'react';
import MainView from '../../components/MainView';
import MainText from '../../components/MainText';
import { COLORS, FONTS, images, SIZES } from '../../constants';
import {
  fontSize,
  scale,
  verticalScale,
  moderateScale,
} from '../../utils/responsive';
import SubmitButton from '../../components/common/button/SubmitButton';
import { showToast } from '../../utils/ToastAndroid';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginAction,
  sendOtp,
  verifyOtp,
} from '../../redux/slices/auth/authSlice';

const RESEND_OTP_TIME = 30;

const Otp = ({ navigation, route }) => {
  const paramsData = route.params;
  // console.log('Otp screen params data ---> ', paramsData)
  const dispatch = useDispatch();
  const { token, user, loading } = useSelector(state => state.auth);
  // console.log('Auth State in Login Screen ---> ', {token, user, loading})

  const [otp, setOtp] = useState(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef([]);
  const [errorData, setErrorData] = useState(null);

  const [timer, setTimer] = useState(RESEND_OTP_TIME);
  const [isResendEnabled, setIsResendEnabled] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0 && !isResendEnabled) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendEnabled(true);
    }
    return () => clearInterval(interval);
  }, [timer, isResendEnabled]);

  const handleOtpChange = (value, index) => {
    if (/^\d$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== '' && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleFocus = index => {
    setActiveIndex(index);
  };

  const formatTimer = sec => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    setTimer(RESEND_OTP_TIME);
    setIsResendEnabled(false);
    setOtp(['', '', '', '']);
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
    dispatch(
      sendOtp({ phone: paramsData?.phone, isCustomer: paramsData?.isCustomer }),
    );
  };

  const validation = () => {
    let error = {};
    const result = otp.join('');
    if (!result) {
      error.otp = 'OTP is required';
      showToast('Otp is required');
    } else if (result.length < 4) {
      error.otp = 'OTP must be 4 digits';
      showToast('OTP must be 4 digits');
    }
    setErrorData(error);
    return Object.keys(error).length === 0;
  };

  const handleOtpPress = async () => {
    if (!validation()) {
      return;
    }
    const response = await dispatch(
      verifyOtp({
        phone: paramsData?.phone,
        otpCode: otp.join(''),
        isCustomer: paramsData?.isCustomer,
      }),
    );

    if (verifyOtp.fulfilled.match(response)) {
      if (paramsData?.isCustomer) {
        // Customer logged in - navigation handled by Root.js
      } else if (!response?.payload?.userData?.isProfileCompleted) {
        navigation.navigate('CreateProfile');
      }
    } else {
      // showToast(response?.payload?.message || 'Failed to send OTP')
    }
  };

  const handleNavigation = () => {
    navigation.goBack();
  };

  return (
    <MainView transparent={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Image source={images.otp} style={styles.images} />
          <MainText style={styles.title}>Verify OTP</MainText>
          <MainText style={styles.desc}>
            {`We’ve sent a 4-digit code to +91 •••••• ${paramsData?.phone?.slice(
              6,
              10,
            )}`}
          </MainText>

          {/* OTP Input Boxes */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                style={[
                  styles.otpInput,
                  // digit ? styles.otpInputFilled : styles.otpInputEMPTY,
                ]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                onFocus={() => handleFocus(index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          <View style={styles.timerContainer}>
            <Pressable style={styles.containerRow} onPress={handleResendOtp}>
              <Text style={styles.resendText}>Resend OTP</Text>
              {!isResendEnabled && (
                <Text style={styles.timerText}>: {formatTimer(timer)}</Text>
              )}
            </Pressable>
          </View>

          <SubmitButton
            title="Verify & Continue"
            onPress={handleOtpPress}
            mainStyle={styles.button}
            loading={loading}
          />

          <View style={styles.footer}>
            <MainText>Already have an account?</MainText>
            <Pressable onPress={handleNavigation}>
              <MainText style={styles.link}> Login</MainText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MainView>
  );
};

export default Otp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  images: {
    width: scale(250),
    height: scale(250),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: verticalScale(80),
  },
  title: {
    fontSize: fontSize(30),
    textAlign: 'center',
    fontFamily: FONTS.medium,
    marginBottom: verticalScale(16),
    marginTop: verticalScale(20),
  },
  desc: {
    fontSize: fontSize(15),
    textAlign: 'center',
    marginHorizontal: scale(25),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: scale(30),
    marginTop: verticalScale(30),
  },
  otpInput: {
    width: scale(55),
    height: verticalScale(55),
    textAlign: 'center',
    fontSize: fontSize(18),
    color: COLORS.white,
    fontFamily: FONTS.medium,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.white}90`,
  },
  otpInputFilled: {
    borderColor: COLORS.b1,
  },
  otpInputEMPTY: {
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.white}90`,
  },
  timerContainer: {
    marginTop: verticalScale(20),
    alignItems: 'center',
  },
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: fontSize(14),
    fontFamily: FONTS.medium,
    color: COLORS.b1,
  },
  timerText: {
    fontSize: fontSize(14),
    marginLeft: 5,
    color: COLORS.b1,
  },
  button: {
    marginTop: verticalScale(40),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: verticalScale(16),
  },
  link: {
    color: COLORS.b1,
    fontFamily: FONTS.medium,
    fontSize: fontSize(15),
  },
});
