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
import MainView from '../../../components/MainView';
import SubmitButton from '../../../components/common/button/SubmitButton';
import Input2 from '../../../components/common/input/Input2';
import Seperator from '../../../components/common/seperator/Seperator';
import CustomHeader from '../../../components/header/CustomHeader';
import { COLORS, FONTS, SIZES } from '../../../constants';
import { pickImage } from '../../../services/picker/cropImagePicker';
import { showToast } from '../../../utils/ToastAndroid';
import { fontSize } from '../../../utils/fontSize';
import {
  getBusinessThunk,
  updateBusinessThunk,
} from '../../../redux/slices/main/businessSlice';

import { MEDIA_BASE_URL } from '../../../services/axios/api';

const BusinessProfile = ({ navigation }) => {
  const dispatch = useDispatch();
  const { businessData, loading, updating } = useSelector(
    state => state.business,
  );
  console.log('Business data', businessData);

  const [form, setForm] = useState({
    name: businessData?.name ?? '',
    email: businessData?.email ?? '',
    phone: businessData?.phone ?? '',
    profileUrl: businessData?.profileUrl ?? '',
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
    if (form.phone.trim() === '') {
      showToast('Mobile is required');
      return false;
    }
    if (form.phone.length < 10) {
      showToast('Mobile should not less than 10 digits');
      return false;
    }
    return true;
  };

  const handleCreatePress = async () => {
    if (!validate()) return;
    const updatedData = {};

    Object.keys(form).forEach(key => {
      const formValue = form[key];
      const userValue = businessData?.[key];

      if ((formValue || '') !== (userValue || '')) {
        updatedData[key] = formValue;
      }
    });

    if (Object.keys(updatedData).length === 0) {
      showToast('No changes to update');
      return;
    }

    console.log('Updated fields ---> ', updatedData);

    const response = await dispatch(updateBusinessThunk({ data: updatedData }));
    if (updateBusinessThunk.fulfilled.match(response)) {
      showToast('Business Profile updated successfully');
      navigation.goBack();
    }
  };

  const handleImageSelect = async () => {
    const res = await pickImage();
    if (res) handleChange('profileUrl', res);
  };

  useEffect(() => {
    dispatch(getBusinessThunk({}));
  }, []);

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

  const getProfileUri = () => {
    if (!form.profileUrl) return null;
    if (typeof form.profileUrl === 'object' && form.profileUrl.uri) {
      return form.profileUrl.uri;
    }
    if (typeof form.profileUrl === 'string') {
      if (form.profileUrl.startsWith('http')) return form.profileUrl;
      return `${MEDIA_BASE_URL}/${form.profileUrl}`;
    }
    return null;
  };

  return (
    <MainView transparent={false}>
      <CustomHeader title="Business Profile" back />

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
        >
          <Pressable style={styles.profileUrl} onPress={handleImageSelect}>
            {form.profileUrl && (
              <Image
                source={{ uri: getProfileUri() }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            )}
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
            />
            <Seperator height={SIZES.height * 0.02} />
            <Input2
              title={'Mobile Number'}
              placeholder="+91 "
              value={form.phone}
              onChangeText={value => handleChange('phone', value)}
              maxLength={10}
              keyboardAppearance={'dark'}
              keyboardType={'numeric'}
            />
          </View>

          <SubmitButton
            title="Update"
            onPress={handleCreatePress}
            mainStyle={styles.button}
            loading={updating}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </MainView>
  );
};

export default BusinessProfile;

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
  profileUrl: {
    width: SIZES.width * 0.3,
    height: SIZES.width * 0.3,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 'auto',
    borderRadius: 100,
    overflow: 'hidden',
  },
});
