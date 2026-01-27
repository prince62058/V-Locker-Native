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
import { COLORS, FONTS, SIZES, icons } from '../../../constants';
import { updateProfile } from '../../../redux/slices/auth/authSlice';
import { pickImage } from '../../../services/picker/cropImagePicker';
import { showToast } from '../../../utils/ToastAndroid';
import { fontSize } from '../../../utils/fontSize';
import { dateFormate } from '../../../utils/formating/date';
import { updateCustomerThunk } from '../../../redux/slices/main/customerSlice';

import { MEDIA_BASE_URL } from '../../../services/axios/api';

const EditCustomer = ({ navigation }) => {
  const dispatch = useDispatch();
  const { customerProfile, loading } = useSelector(state => state.customer);
  console.log('customer profile', customerProfile);

  const [form, setForm] = useState({
    profileUrl: customerProfile?.profileUrl ?? '',
    customerName: customerProfile?.customerName || '',
    customerMobileNumber: customerProfile?.customerMobileNumber || '',
    address: customerProfile?.address ?? '',
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
    if (form.customerName.trim() === '') {
      showToast('Name is required');
      return false;
    }
    if (form.customerMobileNumber.trim() === '') {
      showToast('Mobile is required');
      return false;
    }
    if (form.customerMobileNumber.length < 10) {
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
      const userValue = customerProfile?.[key];
      if ((formValue || '') !== (userValue || '')) {
        updatedData[key] = formValue;
      }
    });

    // WORKAROUND: Backend validation requires at least one text field.
    if (updatedData.profileUrl && !updatedData.customerName) {
      updatedData.customerName = form.customerName;
    }

    if (Object.keys(updatedData).length === 0) {
      showToast('No changes to update');
      return;
    }

    console.log('Updated fields ---> ', updatedData);

    const response = await dispatch(
      updateCustomerThunk({ data: updatedData, id: customerProfile?._id }),
    );
    if (updateCustomerThunk.fulfilled.match(response)) {
      showToast('Profile updated successfully');
      navigation.goBack();
    } else {
      const errorMsg =
        response?.payload || response?.error?.message || 'Update failed';
      console.log('Update customer profile failed:', errorMsg);
      showToast(typeof errorMsg === 'string' ? errorMsg : 'Update failed');
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

  const getProfileUri = () => {
    if (!form.profileUrl) return null;
    if (typeof form.profileUrl === 'object' && form.profileUrl.uri) {
      return form.profileUrl.uri;
    }
    if (typeof form.profileUrl === 'string') {
      if (form.profileUrl.startsWith('http')) return form.profileUrl;
      const cleanPath = form.profileUrl.startsWith('/')
        ? form.profileUrl.substring(1)
        : form.profileUrl;
      return `${MEDIA_BASE_URL}/${cleanPath}?t=${new Date().getTime()}`;
    }
    return null;
  };

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
          <View
            style={{ alignSelf: 'center', marginBottom: SIZES.height * 0.02 }}
          >
            <Pressable style={styles.profileImage} onPress={handleImageSelect}>
              {form.profileUrl && (
                <Image
                  source={{ uri: getProfileUri() }}
                  style={{ width: '100%', height: '100%', borderRadius: 100 }}
                />
              )}
            </Pressable>
            <Pressable style={styles.editView} onPress={handleImageSelect}>
              <Image source={icons.edit} style={styles.editIcon} />
            </Pressable>
          </View>

          <Seperator height={SIZES.height * 0.02} />
          <View style={styles.container}>
            <Input2
              title="Full Name"
              placeholder="Enter your full name"
              value={form.customerName}
              onChangeText={value => handleChange('customerName', value)}
              maxLength={20}
              keyboardAppearance={'dark'}
              keyboardType={'default'}
            />
            <Seperator height={SIZES.height * 0.02} />
            <Input2
              title={'Mobile Number'}
              placeholder="+91 "
              value={form.customerMobileNumber}
              onChangeText={value =>
                handleChange('customerMobileNumber', value)
              }
              maxLength={10}
              keyboardAppearance={'dark'}
              keyboardType={'numeric'}
              editable={false}
            />
            <Seperator height={SIZES.height * 0.02} />
            <Input2
              title={'Location'}
              placeholder="Location address"
              value={form.address}
              onChangeText={value => handleChange('address', value)}
              keyboardAppearance={'dark'}
            />
          </View>

          <SubmitButton
            title="Update"
            onPress={handleCreatePress}
            mainStyle={styles.button}
            loading={loading?.loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </MainView>
  );
};

export default EditCustomer;

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
    // overflow: 'hidden',
  },
  editView: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    height: SIZES.width * 0.09,
    width: SIZES.width * 0.09,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  editIcon: {
    height: SIZES.width * 0.05,
    width: SIZES.width * 0.05,
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
});
