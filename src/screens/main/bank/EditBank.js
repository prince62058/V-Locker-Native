import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import MainView from '../../../components/MainView';
import SubmitButton from '../../../components/common/button/SubmitButton';
import CustomeInput from '../../../components/common/input/CustomeInput';
import CustomHeader from '../../../components/header/CustomHeader';
import { FONTS, SIZES } from '../../../constants';
import { updateBankThunk } from '../../../redux/slices/main/bankSlice';
import { showToast } from '../../../utils/ToastAndroid';
import { fontSize } from '../../../utils/fontSize';

const EditBank = ({ navigation, route }) => {
  const item = route.params;
  // console.log('Bank item', item)

  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.bank);

  const [form, setForm] = useState({
    bankName: item?.bankName ?? '',
    accountNumber: item?.accountNumber ?? '',
    accountHolderName: item?.accountHolderName ?? '',
    ifscCode: item?.ifscCode ?? '',
    upiId: item?.upiId ?? '',
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
    if (form.bankName.trim() === '') {
      showToast('Bank name is required');
      return false;
    }
    if (form.accountNumber.trim() === '') {
      showToast('Bank number is required');
      return false;
    }
    if (form.accountHolderName.trim() === '') {
      showToast('Bank holder name is required');
      return false;
    }
    if (form.ifscCode.trim() === '') {
      showToast('Ifsc code is required');
      return false;
    }
    return true;
  };

  const handleCreatePress = async () => {
    if (!validate()) return;
    const updatedData = {};

    Object.keys(form).forEach(key => {
      const formValue = form[key];
      const userValue = item?.[key];
      if ((formValue || '') !== (userValue || '')) {
        updatedData[key] = formValue;
      }
    });

    if (Object.keys(updatedData).length === 0) {
      showToast('No changes to update');
      return;
    }

    console.log('Updated fields ---> ', updatedData);

    const response = await dispatch(
      updateBankThunk({ bankId: item?._id, data: updatedData }),
    );
    if (updateBankThunk.fulfilled.match(response)) {
      showToast('Back details updated');
      navigation.goBack();
    }
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
      <CustomHeader title="Edit Bank Details" back />

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
          <View style={styles.container}>
            <CustomeInput
              required
              label="Bank Name "
              placeholder="Enter Bank name"
              value={form.bankName}
              onChangeText={text => handleChange('bankName', text)}
              error={errors.bankName}
            />
            <CustomeInput
              required
              label="Bank Account Number "
              placeholder="Enter Bank account number"
              value={form.accountNumber}
              onChangeText={text => handleChange('accountNumber', text)}
              error={errors.accountNumber}
              maxLength={18}
            />
            <CustomeInput
              required
              label="Bank Account Holder Name "
              placeholder="Enter Bank account holder name"
              value={form.accountHolderName}
              onChangeText={text => handleChange('accountHolderName', text)}
              error={errors.accountHolderName}
            />
            <CustomeInput
              required
              label="IFSC Code"
              placeholder="Enter ifsc code"
              value={form.ifscCode}
              onChangeText={text => handleChange('ifscCode', text)}
              error={errors.ifscCode}
            />
            <CustomeInput
              label="UPI ID (Optional)"
              placeholder="Enter UPI ID (e.g., name@bank)"
              value={form.upiId}
              onChangeText={text => handleChange('upiId', text)}
              error={errors.upiId}
              autoCapitalize="none"
            />
          </View>

          <View style={{ gap: SIZES.height * 0.01 }}>
            {form.upiId && (
              <SubmitButton
                title="View QR Code"
                onPress={() =>
                  navigation.navigate('BankQRCode', {
                    bankData: { ...item, ...form },
                  })
                }
                mainStyle={styles.button}
              />
            )}
            <SubmitButton
              title="Update Bank Details"
              onPress={handleCreatePress}
              mainStyle={styles.button}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MainView>
  );
};

export default EditBank;

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
    marginBottom: SIZES.height * 0.01,
    marginHorizontal: 'auto',
  },
});
