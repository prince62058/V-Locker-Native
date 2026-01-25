import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import SubmitButton from '../../components/common/button/SubmitButton';
import Input2 from '../../components/common/input/Input2';
import MainText from '../../components/MainText';
import MainView from '../../components/MainView';
import { COLORS, FONTS, images, SIZES } from '../../constants';
import { registerUser } from '../../redux/slices/auth/authSlice';
import {
  fontSize,
  scale,
  verticalScale,
  moderateScale,
} from '../../utils/responsive';
import { showToast } from '../../utils/ToastAndroid';

const CreateProfile = ({ navigation }) => {
  const dispatch = useDispatch();
  const { token, user, loading } = useSelector(state => state.auth);
  // console.log('Create Profile data ---> ', {token, user, loading})

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: user.phone,
  });
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (value?.length > 0) handleErrorChange(key, null);
  };

  const [error, setError] = useState({});
  const handleErrorChange = (key, value) => {
    setError(prev => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (form.name.trim() === '') {
      showToast('Full name is required');
      return false;
    }
    if (form.email.trim() === '') {
      showToast('Email address is required');
      return false;
    }
    if (form.mobile?.length < 10) {
      showToast('Mobile should be 10 digit');
      return false;
    }
    return true;
  };

  const handleOtpPress = () => {
    if (!validate()) return;
    const { mobile, ...payload } = form;
    dispatch(registerUser(payload));
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
          <Image source={images.profile} style={styles.images} />
          <MainText style={styles.title}>Complete your profile</MainText>
          <MainText style={styles.desc}>
            We Will send you an One Time Password to verify your number.
          </MainText>

          <Input2
            title="Full Name"
            placeholder="Enter full name"
            value={form.name}
            onChangeText={value => handleChange('name', value)}
            maxLength={20}
            keyboardAppearance={'dark'}
            keyboardType={'default'}
          />
          <Input2
            title="Email Address"
            placeholder="example@gmail.com"
            value={form.email}
            onChangeText={value => handleChange('email', value)}
            maxLength={50}
            keyboardAppearance={'dark'}
            keyboardType={'email-address'}
            autoCapitalize={'none'}
          />

          <Input2
            title={'Mobile Number'}
            placeholder="Enter mobile number"
            value={form.mobile}
            onChangeText={value => handleChange('mobile', value)}
            maxLength={10}
            keyboardAppearance={'dark'}
            keyboardType={'numeric'}
            editable={false}
          />

          <SubmitButton
            title="Create"
            onPress={handleOtpPress}
            mainStyle={styles.button}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </MainView>
  );
};

export default CreateProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  images: {
    width: scale(112),
    height: scale(112),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: verticalScale(50),
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
    marginBottom: verticalScale(80),
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
    marginTop: verticalScale(40),
  },
});
