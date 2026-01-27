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
import { sendOtp, loginUser } from '../../redux/slices/auth/authSlice';
import {
  fontSize,
  scale,
  verticalScale,
  moderateScale,
} from '../../utils/responsive';
import { showToast } from '../../utils/ToastAndroid';

const Login = ({ navigation }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector(state => state.auth);
  // console.log('Auth State in Login Screen ---> ', {token, user, loading})

  const [prefix, setPrefix] = useState('+91');
  const [number, setNumber] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleLogin = async () => {
    if (isAdmin) {
      if (!email || !password) {
        showToast('Please enter both email and password');
        return;
      }
      setLocalLoading(true);
      const response = await dispatch(loginUser({ email, password }));
      setLocalLoading(false);
      // Navigation handled by Redux state change (Root.js listens to token)
      if (loginUser.rejected.match(response)) {
        showToast(response.payload || 'Login failed');
      }
    } else {
      handleOtpPress();
    }
  };

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
    setLocalLoading(true);
    // Sending { type: 'login' } to tell backend to check if user exists
    const response = await dispatch(sendOtp({ phone: number, type: 'login' }));
    setLocalLoading(false);
    if (sendOtp.fulfilled.match(response)) {
      navigation.navigate('Otp', {
        phone: number,
        prefix,
        isCustomer: !isAdmin,
      });
    } else {
      showToast(response?.payload?.message || 'Failed to send OTP');
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
          <MainText style={styles.title}>
            {isAdmin ? 'Shop Employee Login' : 'Customer Login'}
          </MainText>
          <MainText style={styles.desc}>
            {isAdmin
              ? 'Enter your credentials to access shop features.'
              : 'we Will send you an One Time Password to verify your number.'}
          </MainText>

          {isAdmin ? (
            <>
              <Input
                placeholder="Enter email"
                value={email}
                onChangeText={setEmail}
                keyboardAppearance={'dark'}
                keyboardType={'email-address'}
                autoCapitalize="none"
                showPrefix={false}
              />
              <Input
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                keyboardAppearance={'dark'}
                secureTextEntry
                showPrefix={false}
              />
            </>
          ) : (
            <Input
              placeholder="Enter mobile number"
              value={number}
              onChangeText={setNumber}
              maxLength={10}
              keyboardAppearance={'dark'}
              keyboardType={'numeric'}
              labelStyle={{
                textAlign: 'center',
                fontSize: fontSize(20),
                marginBottom: verticalScale(10),
              }}
              inputContainerStyle={{
                borderWidth: 0,
                borderBottomWidth: 1,
                backgroundColor: 'transparent',
                borderRadius: 0,
                borderColor: COLORS.white,
                paddingHorizontal: 0,
              }}
            />
          )}

          <SubmitButton
            title={isAdmin ? 'Login' : 'Get OTP'}
            onPress={handleLogin}
            mainStyle={styles.button}
            loading={localLoading}
          />

          <View style={styles.footer}>
            <Pressable onPress={() => setIsAdmin(!isAdmin)}>
              <MainText style={styles.link}>
                {isAdmin ? 'Customer Login' : 'Shop Employee Login'}
              </MainText>
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
    paddingBottom: verticalScale(50),
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
    marginTop: verticalScale(20),
    marginBottom: verticalScale(16),
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
  button: {
    marginTop: verticalScale(24),
    marginHorizontal: scale(30),
  },
});
