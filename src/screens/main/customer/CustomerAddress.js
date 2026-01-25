import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import MainText from '../../../components/MainText';
import MainView from '../../../components/MainView';
import SubmitButton from '../../../components/common/button/SubmitButton';
import CustomeInput from '../../../components/common/input/CustomeInput';
import CitySheet from '../../../components/gorhumsheet/CitySheet';
import CustomHeader from '../../../components/header/CustomHeader';
import { COLORS, FONTS, SIZES } from '../../../constants';
import { showToast } from '../../../utils/ToastAndroid';
import { fontSize, scale, verticalScale } from '../../../utils/responsive';
import { updateAddressThunk } from '../../../redux/slices/main/kycSlice';
import StateSheet from '../../../components/gorhumsheet/StateSheet';
import { getStateThunk } from '../../../redux/slices/auth/authSlice';

const CustomerAddress = ({ navigation }) => {
  const dispatch = useDispatch();
  const { customerProfile } = useSelector(state => state.customer);
  const { loading } = useSelector(state => state.kyc);
  // console.log('customer customerProfile', customerProfile)

  const initialData = {
    customerAddress: customerProfile?.Address?.customerAddress ?? '',
    customerState: customerProfile?.Address?.customerState ?? '',
    customerCity: customerProfile?.Address?.customerCity ?? '',
    landmark: customerProfile?.Address?.landmark ?? '',

    customerProfession: customerProfile?.Address?.customerProfession ?? '',
    customerSalary: String(customerProfile?.Address?.customerSalary ?? ''),

    customerContact1: customerProfile?.Address?.customerContact1 ?? '',
    customerContact2: customerProfile?.Address?.customerContact2 ?? '',
    otherInfo: customerProfile?.Address?.otherInfo ?? '',
  };
  const [form, setForm] = useState(initialData);
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (value?.length > 0) handleErrorChange(key, null);
  };

  const [errors, setError] = useState({});
  const handleErrorChange = (key, value) => {
    setError(prev => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (form.customerAddress.trim() === '') {
      showToast('Customer address is required');
      return false;
    }
    if (form.customerState === '') {
      showToast('State is required');
      return false;
    }
    if (form.customerCity === '') {
      showToast('City is required');
      return false;
    }
    if (form.landmark.trim() === '') {
      showToast('Landmark is required');
      return false;
    }
    if (form.customerProfession.trim() === '') {
      showToast('Profession is required');
      return false;
    }

    if (form.customerSalary.trim() === '') {
      showToast('Salary is required');
      return false;
    }
    if (form.customerContact1.trim() === '') {
      showToast('Primary contact number is required');
      return false;
    }
    if (form.customerContact1.trim().length < 10) {
      showToast('Primary contact number must be at least 10 digits');
      return false;
    }
    if (form.customerContact2.trim() === '') {
      showToast('Secondary contact number is required');
      return false;
    }
    if (form.customerContact2.trim().length < 10) {
      showToast('Secondary contact number must be at least 10 digits');
      return false;
    }

    return true;
  };

  const handleCreatePress = async () => {
    if (!validate()) return;

    const updatedFields = Object.entries(form).reduce((acc, [key, value]) => {
      const oldValue = initialData[key];
      let processedValue = value;

      if (
        key === 'customerState' &&
        typeof value === 'object' &&
        value?.stateName
      ) {
        processedValue = value.stateName;
      }
      if (
        key === 'customerCity' &&
        typeof value === 'object' &&
        value?.cityName
      ) {
        processedValue = value.cityName;
      }

      if (String(processedValue) !== String(oldValue)) {
        acc[key] = processedValue;
      }
      return acc;
    }, {});

    if (Object.keys(updatedFields).length === 0) {
      showToast('No changes to update');
      return;
    }

    console.log('Updated address payload ---> ', updatedFields);

    const response = await dispatch(
      updateAddressThunk({
        data: updatedFields,
        customerId: customerProfile?._id,
      }),
    );

    if (updateAddressThunk.fulfilled.match(response)) {
      showToast('Address details saved successfully');
      navigation.goBack();
    }
  };

  const stateSheetRef = useRef(null);
  const citySheetRef = useRef(null);

  const handlePresent = useCallback(ref => {
    ref.current?.present();
  }, []);
  const handleDismiss = useCallback(ref => {
    ref.current?.dismiss();
  }, []);

  const [sheetOpen, setSheetOpen] = useState({
    testing: false,
    state: false,
    city: false,
  });
  const handleSheetChange = (key, value) => {
    setSheetOpen(prev => ({ ...prev, [key]: value }));
  };

  const onRefresh = useCallback(() => {
    setForm(initialData);
  }, []);

  useEffect(() => {
    dispatch(getStateThunk());
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (sheetOpen.state) {
        handleDismiss(stateSheetRef);
        return true;
      }
      if (sheetOpen.city) {
        handleDismiss(citySheetRef);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [sheetOpen]);

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
      <CustomHeader title="" back />

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
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={false} />
          }
        >
          <View style={styles.container}>
            <MainText
              style={{
                fontSize: fontSize(18),
                marginVertical: verticalScale(15),
                fontFamily: FONTS.medium,
              }}
            >
              Add Customer Address
            </MainText>

            <CustomeInput
              required
              label="Customer Address "
              placeholder="Enter customer address"
              value={form.customerAddress}
              onChangeText={text => handleChange('customerAddress', text)}
              error={errors.customerAddress}
            />
            <CustomeInput
              required
              dropdown
              placeholder="Customer State *"
              value={form.customerState?.stateName ?? form?.customerState}
              error={errors.customerState}
              onPress={() => handlePresent(stateSheetRef)}
            />
            <CustomeInput
              required
              dropdown
              placeholder="Customer City *"
              value={form.customerCity?.cityName ?? form?.customerCity}
              error={errors.customerCity}
              onPress={() => handlePresent(citySheetRef)}
            />
            <CustomeInput
              required
              label="Landmark "
              placeholder="Enter landmark"
              value={form.landmark}
              onChangeText={text => handleChange('landmark', text)}
              error={errors.landmark}
            />

            <MainText
              style={{
                fontSize: fontSize(18),
                marginVertical: 15,
                fontFamily: FONTS.medium,
              }}
            >
              Professional info
            </MainText>

            <CustomeInput
              required
              label="Customer Profession"
              placeholder="Enter Profession"
              value={form.customerProfession}
              onChangeText={text => handleChange('customerProfession', text)}
              error={errors.customerProfession}
            />

            <CustomeInput
              required
              label="Customer Salary (Monthly)"
              placeholder="Enter Salary Amount"
              value={form.customerSalary}
              onChangeText={text => handleChange('customerSalary', text)}
              error={errors.customerSalary}
              mobile
              maxLength={6}
            />

            <MainText
              style={{
                fontSize: fontSize(18),
                marginVertical: 15,
                fontFamily: FONTS.medium,
              }}
            >
              Relative Contact info
            </MainText>

            <CustomeInput
              required
              label="Customer Contact 1"
              placeholder="Enter contact number 1"
              value={form.customerContact1}
              onChangeText={text => handleChange('customerContact1', text)}
              error={errors.customerContact1}
              mobile
              maxLength={10}
            />
            <CustomeInput
              required
              label="Customer Contact 2"
              placeholder="Enter contact number 2"
              value={form.customerContact2}
              onChangeText={text => handleChange('customerContact2', text)}
              error={errors.customerContact2}
              mobile
              maxLength={10}
            />

            <CustomeInput
              label="Other info (Optional)"
              placeholder="Write here..."
              placeholderTextColor={COLORS.borderLight}
              value={form.otherInfo}
              onChangeText={text => handleChange('otherInfo', text)}
              error={errors.otherInfo}
              multiline
            />
          </View>
        </ScrollView>
        <SubmitButton
          title="Submit"
          onPress={handleCreatePress}
          mainStyle={styles.button}
          loading={loading}
        />

        <StateSheet
          ref={stateSheetRef}
          selected={form.customerState}
          onSelect={value => {
            handleChange('customerState', value);
            handleChange('customerCity', '');
            handleDismiss(stateSheetRef);
          }}
          handleSheetChanges={index => handleSheetChange('state', index >= 0)}
        />

        <CitySheet
          ref={citySheetRef}
          listData={form?.customerState}
          selected={form.customerCity}
          onSelect={value => {
            handleChange('customerCity', value);
            handleDismiss(citySheetRef);
          }}
          handleSheetChanges={index => handleSheetChange('city', index >= 0)}
        />
      </KeyboardAvoidingView>
    </MainView>
  );
};

export default CustomerAddress;

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
    marginBottom: verticalScale(10),
    width: '90%',
    alignSelf: 'center',
    marginVertical: verticalScale(10),
  },
});
