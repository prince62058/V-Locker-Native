import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import SubmitButton from '../../components/common/button/SubmitButton';
import Input from '../../components/common/input/Input';
import MainText from '../../components/MainText';
import MainView from '../../components/MainView';
import { COLORS, FONTS, images, SIZES } from '../../constants';
import { sendOtp } from '../../redux/slices/auth/authSlice';
import { fontSize } from '../../utils/fontSize';
import { showToast } from '../../utils/ToastAndroid';

const Login = ({ navigation }) => {
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
    // Sending { type: 'login' } to tell backend to check if user exists
    const response = await dispatch(sendOtp({ phone: number, type: 'login' }));
    if (sendOtp.fulfilled.match(response)) {
      navigation.navigate('Otp', { phone: number, prefix });
    } else {
      // showToast(response?.payload?.message || 'Failed to send OTP')
    }
  };

  const handleNavigation = () => {
    navigation.navigate('Register');
  };
  return (
    <MainView transparent={false} bottomSafe={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Image source={images.login} style={styles.images} />
          <MainText style={styles.title}>Login to continue</MainText>
          <MainText style={styles.desc}>
            We Will send you an One Time Password to verify your number.
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
            <MainText>Don't have an account?</MainText>
            <Pressable onPress={handleNavigation}>
              <MainText style={styles.link}> Sign Up</MainText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MainView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  images: {
    width: SIZES.width * 0.65,
    height: SIZES.width * 0.65,
    resizeMode: 'contain',
    marginHorizontal: 'auto',
    marginTop: SIZES.height * 0.1,
  },
  title: {
    fontSize: fontSize(30),
    textAlign: 'center',
    fontFamily: FONTS.medium,
    marginBottom: SIZES.height * 0.02,
  },
  desc: {
    fontSize: fontSize(15),
    textAlign: 'center',
    marginHorizontal: SIZES.width * 0.07,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SIZES.height * 0.02,
  },
  link: {
    color: COLORS.b1,
    fontFamily: FONTS.medium,
    fontSize: fontSize(15),
  },
});
