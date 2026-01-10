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
import { fontSize } from '../../../utils/fontSize';
import { showToast } from '../../../utils/ToastAndroid';
import { createCustomerThunk } from '../../../redux/slices/main/customerSlice';
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
      profileUrl: form.profileUrl,
    };
    const response = await dispatch(createCustomerThunk(payload));
    if (createCustomerThunk.fulfilled.match(response)) {
      navigation.navigate('CutomerList');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setForm({
        name: '',
        mobile: '',
        address: '',
        profileUrl: '',
      });
      setError({});
    });
    return unsubscribe;
  }, [navigation]);

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
          showsVerticalScrollIndicator={false}
        >
          <MainText style={styles.title}>Add New Customer</MainText>
          <MainText style={styles.desc}>
            Enter the customer’s name and mobile number to get started.
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
    marginHorizontal: SIZES.width * 0.05,
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
    marginHorizontal: 0,
  },
  profileImage: {
    width: SIZES.width * 0.3,
    height: SIZES.width * 0.3,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 'auto',
    borderRadius: 100,
    marginBottom: SIZES.height * 0.02,
    // overflow: 'hidden'
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
