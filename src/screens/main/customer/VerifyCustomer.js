import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MainView from '../../../components/MainView';
import CustomHeader from '../../../components/header/CustomHeader';
import MainText from '../../../components/MainText';
import SubmitButton from '../../../components/common/button/SubmitButton';
import { COLORS, FONTS } from '../../../constants';
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
    const payload = {
      customerName: customerData.name,
      customerMobileNumber: customerData.mobile,
      address: customerData.address,
    };

    await dispatch(sendCustomerOtpThunk(payload));
    setOtp(['', '', '', '']);
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  return (
    <MainView transparent={false}>
      <CustomHeader
        title="Verify Customer"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.container}>
        <MainText style={styles.title}>Verify OTP</MainText>

        <MainText style={styles.subtitle}>
          Enter The Verification Code Received On The{'\n'}
          Customer's Mobile We've Sent A 4-Digit{'\n'}
          Code To +91 {customerData.mobile || '**********'} {'  '}
          <MainText
            onPress={() => navigation.goBack()}
            style={{
              color: COLORS.primary,
              textDecorationLine: 'underline',
              fontFamily: FONTS.bold,
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
                  ? { borderColor: COLORS.primary }
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
          <MainText style={styles.timerText}>01:12</MainText>
          <TouchableOpacity onPress={handleResendOtp}>
            <MainText style={styles.resendText}>Resend Code</MainText>
          </TouchableOpacity>
        </View>

        <SubmitButton
          title="Verify Customer"
          onPress={handleVerifyOtp}
          mainStyle={styles.verifyButton}
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
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize(28),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: fontSize(13),
    fontFamily: FONTS.regular,
    color: '#888888', // Explicitly setting a visible gray color
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 20,
    marginTop: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  otpBox: {
    width: 65,
    height: 65,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: fontSize(28),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  timerText: {
    fontSize: fontSize(14),
    fontFamily: FONTS.regular,
    color: '#FFFFFF', // Setting to white to ensure visibility
  },
  resendText: {
    fontSize: fontSize(14),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  verifyButton: {
    width: '100%',
  },
});
