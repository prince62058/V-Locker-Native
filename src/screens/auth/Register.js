import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import React, { useState } from 'react';
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
import Input from '../../components/common/input/Input';
import { showToast } from '../../utils/ToastAndroid';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp } from '../../redux/slices/auth/authSlice';

const Register = ({ navigation }) => {
  const dispatch = useDispatch();
  const { token, user, loading } = useSelector(state => state.auth);
  // console.log('Auth State in Login Screen ---> ', {token, user, loading})

  const [prefix, setPrefix] = useState('+91');
  const [number, setNumber] = useState('');

  const validate = () => {
    if (number.trim() === '') {
      showToast('Number is required');
      return false;
    }
    if (number?.length < 10) {
      showToast('Number should be 10 digit');
      return false;
    }
    return true;
  };

  const handleOtpPress = async () => {
    if (!validate()) return;
    const response = await dispatch(sendOtp({ phone: number }));
    if (sendOtp.fulfilled.match(response)) {
      showToast('OTP sent successfully');
      navigation.navigate('Otp', { phone: number, prefix });
    } else {
      showToast(response?.payload?.message || 'Failed to send OTP');
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
          <Image source={images.signup} style={styles.images} />
          <MainText style={styles.title}>Create Your Account</MainText>
          <MainText style={styles.desc}>
            Quick sign up to unlock your personalized experience.
          </MainText>

          <Input
            placeholder="Enter mobile number"
            value={number}
            onChangeText={setNumber}
            maxLength={10}
            keyboardAppearance={'dark'}
            keyboardType={'numeric'}
          />

          <SubmitButton
            title="Get OTP"
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

export default Register;

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
