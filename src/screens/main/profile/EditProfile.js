import { useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-native-date-picker';

import MainView from '../../../components/MainView';
import SubmitButton from '../../../components/common/button/SubmitButton';
import Input2 from '../../../components/common/input/Input2';
import Seperator from '../../../components/common/seperator/Seperator';
import CustomHeader from '../../../components/header/CustomHeader';
import { COLORS, FONTS, SIZES } from '../../../constants';
import { updateProfile } from '../../../redux/slices/auth/authSlice';
import { pickImage } from '../../../services/picker/cropImagePicker';
import { showToast } from '../../../utils/ToastAndroid';
import { fontSize } from '../../../utils/fontSize';
import { dateFormate } from '../../../utils/formating/date';

const EditProfile = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  // console.log('User profile', user)

  const [date, setDate] = useState(
    user?.dateOfBirth ? new Date(user?.dateOfBirth) : new Date(),
  );
  const [open, setOpen] = useState(false);
  const toggleDateModal = () => {
    setOpen(!open);
  };

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || user?.mobile || user?.mobileNumber || '',
    profileUrl: user?.profileUrl ?? '',
    dateOfBirth: user?.dateOfBirth ?? '',
  });
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (value?.length > 0) handleErrorChange(key, null);
  };

  const [errors, setError] = useState({});
  const handleErrorChange = (key, value) => {
    setError(prev => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (form.name.trim() === '') {
      showToast('Name is required');
      return false;
    }
    if (form.email.trim() === '') {
      showToast('Email is required');
      return false;
    }
    /* if (form.mobile.trim() === '') {
      showToast('Mobile is required');
      return false;
    }
    if (form.mobile.length < 10) {
      showToast('Mobile should not less than 10 digits');
      return false;
    } */
    return true;
  };

  const handleCreatePress = async () => {
    if (!validate()) return;
    const updatedData = {};

    Object.keys(form).forEach(key => {
      if (key === 'mobile' || key === 'phone') return;

      const formValue = form[key];
      const userValue = user?.[key];

      if ((formValue || '') !== (userValue || '')) {
        updatedData[key] = formValue;
      }
    });

    if (Object.keys(updatedData).length === 0) {
      showToast('No changes to update');
      return;
    }

    console.log('Updated fields ---> ', updatedData);

    const response = await dispatch(updateProfile({ data: updatedData }));
    if (updateProfile.fulfilled.match(response)) {
      showToast('Profile updated successfully');
      navigation.goBack();
    }
  };

  const handleImageSelect = async () => {
    const res = await pickImage();
    if (res) handleChange('profileUrl', res);
  };

  const [keyboardOffset, setKeyboardOffset] = useState(0);
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
      <CustomHeader title="Edit Profile" back />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
          }}
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.profileImage} onPress={handleImageSelect}>
            {form.profileUrl && (
              <Image
                source={{ uri: form.profileUrl?.uri || form?.profileUrl }}
                style={{ width: '100%', height: '100%', borderRadius: 100 }}
              />
            )}
            <Image source={require('./image.png')} style={styles.editIcon} />
          </Pressable>

          <Seperator height={SIZES.height * 0.02} />
          <View style={styles.container}>
            <Input2
              title="Full Name"
              placeholder="Enter your full name"
              value={form.name}
              onChangeText={value => handleChange('name', value)}
              maxLength={20}
              keyboardAppearance={'dark'}
              keyboardType={'default'}
            />
            <Seperator height={SIZES.height * 0.02} />
            <Input2
              title="Email Address"
              placeholder="example@gmail.com"
              value={form.email}
              onChangeText={value => handleChange('email', value)}
              maxLength={50}
              keyboardAppearance={'dark'}
              keyboardType={'email-address'}
              autoCapitalize={'none'}
              editable={false}
              mainStyle={{ color: 'gray' }}
            />
            <Seperator height={SIZES.height * 0.02} />
            {/* 
            <Input2
              title={'Mobile Number'}
              placeholder="+91 "
              value={form.mobile}
              onChangeText={value => handleChange('mobile', value)}
              maxLength={10}
              keyboardAppearance={'dark'}
              keyboardType={'numeric'}
              editable={false}
            />
            <Seperator height={SIZES.height * 0.02} /> 
            */}

            <Input2
              title={'Date of birth'}
              placeholder="DD - MM - YYYY "
              value={dateFormate(form?.dateOfBirth)}
              editable={false}
              onPress={toggleDateModal}
            />
          </View>

          <SubmitButton
            title="Update"
            onPress={handleCreatePress}
            mainStyle={styles.button}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        theme="dark"
        maximumDate={new Date()}
        onConfirm={date => {
          toggleDateModal();
          setDate(date);
          handleChange('dateOfBirth', date?.toISOString());
        }}
        onCancel={toggleDateModal}
      />
    </MainView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginHorizontal: SIZES.width * 0.05
  },
  title: {
    fontSize: fontSize(30),
    fontFamily: FONTS.medium,
    marginBottom: SIZES.height * 0.03,
  },
  desc: {
    fontSize: fontSize(15),
    width: SIZES.width * 0.8,
    marginBottom: SIZES.height * 0.05,
  },
  seperator: {
    height: SIZES.height * 0.03,
  },
  button: {
    marginBottom: SIZES.height * 0.01,
    marginHorizontal: 'auto',
  },
  profileImage: {
    width: SIZES.width * 0.3,
    height: SIZES.width * 0.3,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 'auto',
    borderRadius: 100,
    // overflow: 'hidden' // [MODIFIED] Removed overflow hidden to allow icon to show
  },
  editIcon: {
    width: 30,
    height: 30,
    position: 'absolute',
    bottom: 0,
    right: 10,
    zIndex: 10,
  },
});
