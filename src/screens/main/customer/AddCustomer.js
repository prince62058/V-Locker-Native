import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Image,
  Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import SubmitButton from '../../../components/common/button/SubmitButton';
import CustomeInput from '../../../components/common/input/CustomeInput';
import CustomHeader from '../../../components/header/CustomHeader';
import MainText from '../../../components/MainText';
import MainView from '../../../components/MainView';
import { FONTS, SIZES, COLORS } from '../../../constants';
import { fontSize, scale, verticalScale } from '../../../utils/responsive';
import { showToast } from '../../../utils/ToastAndroid';
import {
  sendCustomerOtpThunk,
  createCustomerThunk,
} from '../../../redux/slices/main/customerSlice';
import { pickImage } from '../../../services/picker/cropImagePicker';

const AddCustomer = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, customerData } = useSelector(state => state.customer);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    address: '',
    profileUrl: '',
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

    if (form.mobile?.length < 10) {
      showToast('Mobile should be 10 digit');
      return false;
    }
    if (form.address.trim() === '') {
      showToast('Address is required');
      return false;
    }
    return true;
  };

  const handleCreatePress = async () => {
    if (!validate()) return;

    const payload = {
      customerName: form.name,
      customerMobileNumber: form.mobile,
      address: form.address,
    };

    const response = await dispatch(sendCustomerOtpThunk(payload));
    if (sendCustomerOtpThunk.fulfilled.match(response)) {
      // showToast('OTP sent successfully'); // handled in thunk
      navigation.navigate('VerifyCustomer', {
        customerData: {
          ...form,
          // profileUrl might be an object { uri: ... } or string depending on picker
        },
      });
    }
  };

  const handleImageSelect = async () => {
    const res = await pickImage();
    if (res) handleChange('profileUrl', res);
  };

  return (
    <MainView transparent={false}>
      <CustomHeader title="Add Customer" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: SIZES.height * 0.2 }}
          showsVerticalScrollIndicator={false}
        >
          <MainText style={styles.title}>Add New Customer</MainText>
          <MainText style={styles.desc}>
            Enter the customer's name and mobile number to get started.
          </MainText>

          <Pressable style={styles.profileImage} onPress={handleImageSelect}>
            {form.profileUrl && (
              <Image
                source={{ uri: form.profileUrl?.uri || form?.profileUrl }}
                style={{ width: '100%', height: '100%', borderRadius: 100 }}
              />
            )}
            <Image
              source={require('../profile/image.png')}
              style={styles.editIcon}
            />
          </Pressable>

          <CustomeInput
            required
            label="Customer Name "
            placeholder="Enter full name"
            value={form.name}
            onChangeText={text => handleChange('name', text)}
            // error={errors.address}
          />
          <View style={styles.seperator} />
          <CustomeInput
            required
            label="Customer Mobile Number"
            placeholder="Enter mobile number"
            value={form.mobile}
            onChangeText={text => handleChange('mobile', text)}
            mobile
            maxLength={10}
            // error={errors.address}
          />
          <View style={styles.seperator} />

          <CustomeInput
            required
            label="Address"
            placeholder="Enter address"
            value={form.address}
            onChangeText={text => handleChange('address', text)}
            // error={errors.address}
          />

          <SubmitButton
            title="Create"
            onPress={handleCreatePress}
            mainStyle={styles.button}
            // disabled={true}
            loading={loading.loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </MainView>
  );
};

export default AddCustomer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: scale(20),
  },
  title: {
    fontSize: fontSize(30),
    fontFamily: FONTS.medium,
    marginBottom: verticalScale(24),
  },
  desc: {
    fontSize: fontSize(15),
    width: '100%',
    marginBottom: verticalScale(40),
  },
  seperator: {
    height: verticalScale(24),
  },
  button: {
    marginHorizontal: 0,
    width: '100%',
    marginTop: verticalScale(10),
  },
  profileImage: {
    width: scale(112),
    height: scale(112),
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
    borderRadius: scale(112) / 2,
    marginBottom: verticalScale(16),
    // overflow: 'hidden'
  },
  editIcon: {
    width: scale(30),
    height: scale(30),
    position: 'absolute',
    bottom: 0,
    right: scale(10),
    zIndex: 10,
  },
});
