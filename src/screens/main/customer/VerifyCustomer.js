import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MainView from '../../../components/MainView';
import CustomHeader from '../../../components/header/CustomHeader';
import MainText from '../../../components/MainText';
import SubmitButton from '../../../components/common/button/SubmitButton';
import { COLORS, FONTS, images } from '../../../constants';
import { fontSize } from '../../../utils/fontSize';
import { showToast } from '../../../utils/ToastAndroid';
import {
  sendCustomerOtpThunk,
  verifyCustomerOtpThunk,
  updateCustomerThunk,
} from '../../../redux/slices/main/customerSlice';

const VerifyCustomer = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.customer);
  const customerData = route.params?.customerData || {};

  const [otp, setOtp] = useState(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
  };

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 4) {
      showToast('Please enter 4-digit OTP');
      return;
    }

    const payload = {
      customerMobileNumber: customerData.mobile,
      otp: otpCode,
    };

    const response = await dispatch(verifyCustomerOtpThunk(payload));
    if (verifyCustomerOtpThunk.fulfilled.match(response)) {
      const customer = response.payload;
      if (customer?._id && customerData.profileUrl) {
        await dispatch(
          updateCustomerThunk({
            id: customer._id,
            data: { profileUrl: customerData.profileUrl },
          }),
        );
      }
      navigation.navigate('ViewCustomer', { id: customer?._id });
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    const payload = {
      customerName: customerData.name,
      customerMobileNumber: customerData.mobile,
      address: customerData.address,
    };

    await dispatch(sendCustomerOtpThunk(payload));
    setOtp(['', '', '', '']);
    setTimer(60);
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  return (
    <MainView transparent={false}>
      <CustomHeader title="" back />

      {/* <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      > */}
      {/* If user needs back button, it's here implicitly via gesture or hard back, 
            but for UI I will just not render the specific header bar. 
            Or I can use a simple absolute positioned back icon if needed.
            For now, adhering to the image which has NO header bar.
        */}
      {/* </TouchableOpacity> */}

      <View style={styles.container}>
        <Image
          source={images.otp}
          style={styles.lockImage}
          resizeMode="contain"
        />

        <MainText style={styles.title}>Verify OTP</MainText>

        <MainText style={styles.subtitle}>
          We've Sent A 6-Digit Code To{'\n'}
          +91 ••••••{' '}
          {customerData.mobile ? customerData.mobile.slice(-4) : '3210'}{' '}
          <MainText
            onPress={() => navigation.goBack()}
            style={{
              color: COLORS.white, // Keeping it white to match or maybe a subtle color
              textDecorationLine: 'underline',
              fontFamily: FONTS.bold,
              fontSize: fontSize(14),
            }}
          >
            Edit
          </MainText>
        </MainText>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <View
              key={index}
              style={[
                styles.otpBox,
                digit || index === activeIndex
                  ? { borderColor: COLORS.white }
                  : { borderColor: '#555555' },
              ]}
            >
              <TextInput
                ref={ref => (inputRefs.current[index] = ref)}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpInput}
                returnKeyType={index === 3 ? 'done' : 'next'}
                placeholderTextColor="#555" // Placeholder color if needed
                selectionColor={COLORS.white}
                onSubmitEditing={() => {
                  if (index < 3) {
                    inputRefs.current[index + 1]?.focus();
                  }
                }}
              />
            </View>
          ))}
        </View>

        <View style={styles.timerRow}>
          <MainText style={styles.timerText}>{formatTime(timer)}</MainText>
          <TouchableOpacity onPress={handleResendOtp} disabled={timer > 0}>
            <MainText
              style={[styles.resendText, { opacity: timer > 0 ? 0.5 : 1 }]}
            >
              Resend Code
            </MainText>
          </TouchableOpacity>
        </View>

        <SubmitButton
          title="Verify & Continue"
          onPress={handleVerifyOtp}
          mainStyle={styles.verifyButton}
          titleStyle={{ fontSize: 16, fontFamily: FONTS.bold }} // Adjust if needed
          loading={loading.loading}
        />
      </View>
    </MainView>
  );
};

export default VerifyCustomer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  lockImage: {
    width: 200,
    height: 180,
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: fontSize(26),
    fontFamily: FONTS.medium,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: fontSize(14),
    fontFamily: FONTS.regular,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderBottomWidth: 2, // Underline style
    borderColor: '#555555',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: fontSize(24),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    paddingBottom: 5, // Adjust for align with underline
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15, // Match indentation of outer items
    marginBottom: 40,
  },
  timerText: {
    fontSize: fontSize(14),
    fontFamily: FONTS.regular,
    color: '#FFFFFF',
  },
  resendText: {
    fontSize: fontSize(14),
    fontFamily: FONTS.medium,
    color: COLORS.white, // White as per design appearance? Or keeping primary if preferred. Design looks white/light.
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#1E1B4B', // Dark blueish color from image, or use primary but checking consistency.
    // The image has a deep blue button. I will try to match or use existing primary if it's close.
    // If not, I'll stick to COLORS.primary but maybe override styles.
    // Let's use a custom color closer to the image "Verify & Continue" button.
    backgroundColor: '#201A5E',
    borderRadius: 8,
    height: 50,
  },
});
