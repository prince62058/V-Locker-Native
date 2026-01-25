import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Easing,
  Pressable,
  BackHandler,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MainView from '../../../components/MainView';
import CustomHeader from '../../../components/header/CustomHeader';
import { useDispatch, useSelector } from 'react-redux';
import CustomeInput from '../../../components/common/input/CustomeInput';
import { COLORS, FONTS, SIZES } from '../../../constants';
import { fontSize } from '../../../utils/fontSize';
import SubmitButton from '../../../components/common/button/SubmitButton';
import { showToast } from '../../../utils/ToastAndroid';
import MainText from '../../../components/MainText';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { createLoanThunk } from '../../../redux/slices/main/customerSlice';
import { updateLoanThunk } from '../../../redux/slices/main/loanSlice';
import {
  getMobileBrandThunk,
  getMobileModelThunk,
} from '../../../redux/slices/auth/authSlice';
import BrandSheet from '../../../components/gorhumsheet/BrandSheet';
import ModelSheet from '../../../components/gorhumsheet/ModelSheet';
import FrequencySheet from '../../../components/gorhumsheet/FrequencySheet';
import FinancerSheet from '../../../components/gorhumsheet/FinancerSheet';
import PaymentSheet from '../../../components/gorhumsheet/PaymentSheet';
import DatePicker from 'react-native-date-picker';
import { dateFormate } from '../../../utils/formating/date';
import TermsConditionModal from '../../../components/Modal/TermsConditionModal';
import QRCode from 'react-native-qrcode-svg';
import { Modal } from 'react-native';

const CreateLoan = ({ navigation, route }) => {
  const { customerId, isEdit, loanId } = route.params;
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.customer);
  const { loanDetails } = useSelector(state => state.loan);

  const initialData = {
    installationType: 'New Phone',
    mobileBrand: '',
    mobileModel: '',
    imeiNumber1: '',
    imeiNumber2: '',
    mobilePrice: '',

    processingFees: '',
    downPayment: '',
    frequency: '',
    numberOfEMIs: '',
    interestRate: '',
    loanAmount: '',
    emiAmount: '',
    firstEmiDate: '',
    financer: '',
    paymentOptions: '',
    description: '',
    autoUnlock: false,
    policy: false,
  };
  const [form, setForm] = useState(initialData);
  const [createdLoanId, setCreatedLoanId] = useState(null);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (value?.length > 0) handleErrorChange(key, null);
  };

  const [errors, setError] = useState({});
  const handleErrorChange = (key, value) => {
    setError(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (isEdit && loanDetails) {
      setForm(prev => ({
        ...prev,
        installationType: loanDetails.installationType || 'New Phone',
        mobileBrand: { brandName: loanDetails.mobileBrand },
        mobileModel: { modelName: loanDetails.mobileModel },
        imeiNumber1: loanDetails.imeiNumber1 || '',
        imeiNumber2: loanDetails.imeiNumber2 || '',
        mobilePrice: String(loanDetails.mobilePrice || ''),
        processingFees: String(loanDetails.processingFees || ''),
        downPayment: String(loanDetails.downPayment || ''),
        frequency: {
          title: loanDetails.frequency,
          value: loanDetails.frequency,
        },
        numberOfEMIs: String(loanDetails.numberOfEMIs || ''),
        interestRate: String(loanDetails.interestRate || ''),
        loanAmount: String(loanDetails.loanAmount || ''),
        emiAmount: String(loanDetails.emiAmount || ''),
        firstEmiDate: loanDetails.firstEmiDate || '',
        financer: { title: loanDetails.financer, value: loanDetails.financer },
        paymentOptions: {
          title: loanDetails.paymentOptions,
          value: loanDetails.paymentOptions,
        },
        description: loanDetails.description || '',
        autoUnlock: loanDetails.autoUnlock || false,
        policy: true, // Assuming agreed if editing
      }));
      if (loanDetails.firstEmiDate) {
        setDate(new Date(loanDetails.firstEmiDate));
      }
      if (loanDetails.autoUnlock) {
        setAutoUnlockEnabled(true);
      }
    }
  }, [isEdit, loanDetails]);

  useEffect(() => {
    // Only calculate if not blocked or if user is interacting?
    // For now, let it run, but ensure the initial setForm sets string values to avoid NaN issues if ParseFloat fails.
    const price = parseFloat(form.mobilePrice) || 0;
    const processing = parseFloat(form.processingFees) || 0;
    const down = parseFloat(form.downPayment) || 0;

    const calculatedLoan = price + processing - down;

    setForm(prev => ({
      ...prev,
      loanAmount: calculatedLoan.toString(),
    }));
  }, [form.mobilePrice, form.processingFees, form.downPayment]);

  // EDITED: Updated EMI Calculation logic
  useEffect(() => {
    const loan = parseFloat(form.loanAmount) || 0;
    const emiCount = parseFloat(form.numberOfEMIs) || 0;
    const rate = parseFloat(form.interestRate) || 0;

    console.log('EMI Calculation Debug:', { loan, emiCount, rate });

    if (loan > 0 && emiCount > 0) {
      // Formula: (Loan + (Loan * Rate / 100)) / EMIs
      // Rate is considered as Total Interest Rate for the tenure (as per label instructions)
      const totalInterest = loan * (rate / 100);
      const totalAmount = loan + totalInterest;
      const emiVal = totalAmount / emiCount;

      console.log('Calculated EMI:', emiVal);

      // Using Math.ceil to ensure full coverage
      setForm(prev => ({ ...prev, emiAmount: Math.ceil(emiVal).toString() }));
    } else {
      // If invalid, default to 0 to indicate issue, but only if user has started interaction?
      // For edit mode, this might wipe existing if parsing fails.
      // Assuming valid inputs from DB/Form.
      if (loan === 0 || emiCount === 0) {
        setForm(prev => ({ ...prev, emiAmount: '0' }));
      }
    }
  }, [form.loanAmount, form.numberOfEMIs, form.interestRate]);

  const validate = () => {
    if (form.mobileBrand === '') {
      showToast('Mobile brand is required');
      return false;
    }
    if (form.mobileModel === '') {
      showToast('Mobile model is required');
      return false;
    }
    if (form.imeiNumber1.trim() === '') {
      showToast('IMEI 1 is required');
      return false;
    }
    if (form.imeiNumber1.length < 15) {
      showToast('IMEI 1 should not be less than 15 digits');
      return false;
    }
    if (form.imeiNumber2.trim() === '') {
      showToast('IMEI Number 2 is required');
      return false;
    }
    if (form.imeiNumber2.length < 15) {
      showToast('IMEI 2 should not be less than 15 digits');
      return false;
    }
    if (form.mobilePrice.trim() === '') {
      showToast('Mobile price is required');
      return false;
    }
    if (form.policy === false) {
      handleModal('terms', !modal?.terms);
      // showToast('Accept the loan policy to move further.')
      return false;
    }
    return true;
  };

  // EDITED: Added function to generate installments
  const generateInstallments = (
    emiAmount,
    numberOfEMIs,
    firstDate,
    frequency,
  ) => {
    let installments = [];
    let currentDate = new Date(firstDate);
    const count = parseInt(numberOfEMIs) || 0;
    const amount = emiAmount; // string

    if (!currentDate.getTime()) return [];

    for (let i = 0; i < count; i++) {
      let dueDate = new Date(currentDate);
      installments.push({
        installmentNumber: i + 1,
        dueDate: dueDate.toISOString(),
        amount: Number(amount),
        status: 'PENDING',
      });

      // Increment date based on frequency
      if (frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        // Default Monthly
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    return installments;
  };

  const handleCreatePress = async () => {
    if (!validate()) return;

    const {
      policy,
      processingFees,
      downPayment,
      numberOfEMIs,
      interestRate,
      emiAmount,
      mobilePrice,
      loanAmount,
      mobileBrand,
      mobileModel,
      financer,
      frequency,
      paymentOptions,
      ...payload
    } = form;

    // EDITED: Generate and include installments in payload
    const installments = generateInstallments(
      emiAmount,
      numberOfEMIs,
      form.firstEmiDate || new Date(),
      frequency?.value,
    );

    let data = {
      processingFees: Number(processingFees),
      downPayment: Number(downPayment),
      numberOfEMIs: Number(numberOfEMIs || 1),
      interestRate: Number(interestRate),
      emiAmount: Number(emiAmount),
      mobilePrice: Number(mobilePrice),
      loanAmount: Number(loanAmount),
      mobileBrand: mobileBrand?.brandName,
      mobileModel: mobileModel?.modelName,
      financer: financer?.value,
      frequency: frequency?.value,
      paymentOptions: paymentOptions?.value,
      installments: installments, // Add generated installments
      ...payload,
    };

    data = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== ''),
    );

    console.log('loan form data with installments', data);

    if (isEdit) {
      const response = await dispatch(updateLoanThunk({ id: loanId, data }));
      if (updateLoanThunk.fulfilled.match(response)) {
        showToast('Loan updated successfully');
        navigation.goBack();
      }
    } else {
      const response = await dispatch(createLoanThunk({ customerId, data }));
      if (createLoanThunk.fulfilled.match(response)) {
        showToast('Customer loan created successfully');
        const loanId = response?.payload?.data?._id || 'LOAN_ID_PENDING';
        setCreatedLoanId(loanId);
        handleModal('qr', true);
      }
    }
  };

  const brandSheetRef = useRef(null);
  const modelSheetRef = useRef(null);
  const frequencySheetRef = useRef(null);
  const financerSheetRef = useRef(null);
  const paymentSheetRef = useRef(null);

  const handlePresent = useCallback(ref => {
    ref.current?.present();
  }, []);
  const handleDismiss = useCallback(ref => {
    ref.current?.dismiss();
  }, []);

  const [sheetOpen, setSheetOpen] = useState({
    brand: false,
    model: false,
    frequency: false,
    financer: false,
    payment: false,
  });
  const handleSheetChange = (key, value) => {
    setSheetOpen(prev => ({ ...prev, [key]: value }));
  };

  const [date, setDate] = useState(new Date());
  const [modal, setModal] = useState({ date: false, terms: false, qr: false });
  const handleModal = (key, value) => {
    setModal(prev => ({ ...prev, [key]: value }));
  };

  const onRefresh = useCallback(() => {
    setForm(initialData);
  }, []);

  useEffect(() => {
    dispatch(getMobileBrandThunk({}));
    dispatch(getMobileModelThunk({}));
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (sheetOpen.brand) {
        handleDismiss(brandSheetRef);
        return true;
      }
      if (sheetOpen.model) {
        handleDismiss(modelSheetRef);
        return true;
      }
      if (sheetOpen.frequency) {
        handleDismiss(frequencySheetRef);
        return true;
      }
      if (sheetOpen.financer) {
        handleDismiss(financerSheetRef);
        return true;
      }
      if (sheetOpen.payment) {
        handleDismiss(paymentSheetRef);
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

  const [autoUnlockEnabled, setAutoUnlockEnabled] = useState(false);
  const animatedValue = useState(new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: autoUnlockEnabled ? 1 : 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [autoUnlockEnabled]);

  const toggleSwitch = () => {
    const newValue = !autoUnlockEnabled;
    setAutoUnlockEnabled(newValue);
    handleChange('autoUnlock', newValue);
  };

  return (
    <MainView transparent={false}>
      <CustomHeader title={isEdit ? 'Edit Loan' : 'Create New Loan'} back />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={false} />
          }
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.installationTypeContainer}>
              <MainText style={styles.installationTypeTitle}>
                Installation Type*
              </MainText>
              <Pressable style={styles.radioButtonRow}>
                <MainText>New Phone</MainText>
                <Pressable
                  onPress={() => handleChange('installationType', 'New Phone')}
                  style={styles.radioButton}
                >
                  {form.installationType === 'New Phone' && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </Pressable>
              </Pressable>
              <Pressable style={styles.radioButtonRow}>
                <MainText>Old/Running Phone</MainText>
                <Pressable
                  onPress={() =>
                    handleChange('installationType', 'Old/Running Phone')
                  }
                  style={styles.radioButton}
                >
                  {form.installationType === 'Old/Running Phone' && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </Pressable>
              </Pressable>
            </View>

            <CustomeInput
              required
              dropdown
              placeholder="Mobile Brand *"
              value={form.mobileBrand?.brandName}
              error={errors.mobileBrand}
              onPress={() => handlePresent(brandSheetRef)}
            />
            <CustomeInput
              required
              dropdown
              placeholder="Mobile Model *"
              value={form.mobileModel?.modelName}
              error={errors.mobileModel}
              onPress={() => handlePresent(modelSheetRef)}
            />
            <CustomeInput
              required
              label="IMEI Number 1"
              placeholder="Enter IMEI number 1"
              value={form.imeiNumber1}
              onChangeText={text => handleChange('imeiNumber1', text)}
              error={errors.imeiNumber1}
              scanner
              maxLength={15}
            />
            <CustomeInput
              required
              label="IMEI Number 2"
              placeholder="Enter IMEI number 2"
              value={form.imeiNumber2}
              onChangeText={text => handleChange('imeiNumber2', text)}
              error={errors.imeiNumber2}
              scanner
              maxLength={15}
            />
            <CustomeInput
              required
              label="Mobile Price"
              placeholder="Enter mobile price"
              value={form.mobilePrice}
              onChangeText={text => handleChange('mobilePrice', text)}
              error={errors.mobilePrice}
            />

            <CustomeInput
              label="Processing Fees"
              placeholder="Enter processing fees"
              value={form.processingFees}
              onChangeText={text => handleChange('processingFees', text)}
              error={errors.processingFees}
            />
            <CustomeInput
              label="Down Payment"
              placeholder="Enter down payment"
              value={form.downPayment}
              onChangeText={text => handleChange('downPayment', text)}
              error={errors.downPayment}
            />
            <CustomeInput
              required
              dropdown
              placeholder="Frequency of Collection"
              value={form.frequency?.title}
              error={errors.frequency}
              onPress={() => handlePresent(frequencySheetRef)}
            />
            <CustomeInput
              label="Number of EMIs"
              placeholder="Enter number of EMIs"
              value={form.numberOfEMIs}
              onChangeText={text => handleChange('numberOfEMIs', text)}
              error={errors.numberOfEMIs}
            />
            <CustomeInput
              label="Interest Rate (%) Enter Rate According to Number of EMIs"
              placeholder="Enter interest rate"
              value={form.interestRate}
              onChangeText={text => handleChange('interestRate', text)}
              error={errors.interestRate}
            />
            <CustomeInput
              label="Loan Amount"
              placeholder="Enter loan amount"
              value={form.loanAmount}
              onChangeText={text => handleChange('loanAmount', text)}
              error={errors.loanAmount}
              notEditable
            />
            <CustomeInput
              label="EMI Amount"
              placeholder="Enter EMI amount"
              value={form.emiAmount}
              onChangeText={text => handleChange('emiAmount', text)}
              error={errors.emiAmount}
              notEditable
            />
            <CustomeInput
              date
              label="First EMI Date"
              placeholder="Enter first EMI date"
              value={dateFormate(form?.firstEmiDate)}
              error={errors.firstEmiDate}
              onPress={() => handleModal('date', true)}
            />
            <CustomeInput
              required
              dropdown
              placeholder="Financer"
              value={form.financer?.title}
              error={errors.financer}
              onPress={() => handlePresent(financerSheetRef)}
            />
            <CustomeInput
              required
              dropdown
              placeholder="Payment Options"
              value={form.paymentOptions?.title}
              error={errors.paymentOptions}
              onPress={() => handlePresent(paymentSheetRef)}
            />
            <CustomeInput
              label="Description (Optional)"
              placeholder="Write here..."
              value={form.description}
              onChangeText={value => handleChange('description', value)}
              error={errors.description}
              multiline
            />

            <View style={styles.autoUnlockContainer}>
              <View style={styles.autoUnlockHeader}>
                <MainText style={styles.autoUnlockTitle}>Auto Unlock</MainText>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={toggleSwitch}
                  style={[
                    styles.switchContainer,
                    {
                      backgroundColor: autoUnlockEnabled
                        ? COLORS.primary
                        : COLORS.borderLight,
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.switchThumb,
                      {
                        transform: [
                          {
                            translateX: animatedValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, fontSize(20)],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                </TouchableOpacity>
              </View>

              <MainText style={styles.autoUnlockDescription}>
                Sends a reminder before due date, locks the device if payment is
                missed, and automatically unlocks once payment is made.
              </MainText>
            </View>

            <View style={styles.policyContainer}>
              <Pressable
                onPress={() => handleChange('policy', !form.policy)}
                style={styles.checkbox}
              >
                {form.policy && (
                  <MaterialIcons
                    name="check"
                    color={COLORS.white}
                    size={fontSize(15)}
                  />
                )}
              </Pressable>
              <MainText style={styles.policyText}>I accept to loan </MainText>
              <Pressable>
                <MainText style={styles.termsText}>Terms & Conditions</MainText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        <SubmitButton
          title={isEdit ? 'Update' : 'Create'}
          onPress={handleCreatePress}
          mainStyle={styles.button}
          loading={loading.loading}
        />

        <BrandSheet
          ref={brandSheetRef}
          selected={form.mobileBrand}
          onSelect={value => {
            handleChange('mobileBrand', value);
            handleDismiss(brandSheetRef);
          }}
          handleSheetChanges={index => handleSheetChange('brand', index >= 0)}
        />

        <ModelSheet
          ref={modelSheetRef}
          selected={form.mobileModel}
          onSelect={value => {
            handleChange('mobileModel', value);
            handleDismiss(modelSheetRef);
          }}
          handleSheetChanges={index => handleSheetChange('model', index >= 0)}
        />

        <FrequencySheet
          ref={frequencySheetRef}
          selected={form.frequency}
          onSelect={value => {
            handleChange('frequency', value);
            handleDismiss(frequencySheetRef);
          }}
          handleSheetChanges={index =>
            handleSheetChange('frequency', index >= 0)
          }
        />
        <FinancerSheet
          ref={financerSheetRef}
          selected={form.financer}
          onSelect={value => {
            handleChange('financer', value);
            handleDismiss(financerSheetRef);
          }}
          handleSheetChanges={index =>
            handleSheetChange('financer', index >= 0)
          }
        />
        <PaymentSheet
          ref={paymentSheetRef}
          selected={form.paymentOptions}
          onSelect={value => {
            handleChange('paymentOptions', value);
            handleDismiss(paymentSheetRef);
          }}
          handleSheetChanges={index => handleSheetChange('payment', index >= 0)}
        />
        <DatePicker
          modal
          open={modal?.date}
          date={date}
          mode="date"
          theme="dark"
          minimumDate={new Date()}
          onConfirm={date => {
            handleModal('date', false);
            setDate(date);
            handleChange('firstEmiDate', date?.toISOString());
          }}
          onCancel={() => handleModal('date', false)}
        />

        <TermsConditionModal
          visible={modal?.terms}
          handleModalToggle={() => handleModal('terms', !modal?.terms)}
          handleConfirm={() => {
            handleChange('policy', !form.policy);
            handleModal('terms', !modal?.terms);
          }}
        />

        <Modal
          visible={modal.qr}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            handleModal('qr', false);
            navigation.goBack();
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <MainText style={styles.modalTitle}>
                Device Provisioning QR
              </MainText>
              <MainText style={styles.modalSubtitle}>
                Scan this on the customer's *New Phone* during setup (6-tap).
              </MainText>

              <View style={styles.qrWrapper}>
                <QRCode
                  value={JSON.stringify({
                    'android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME':
                      'com.vlocker/.MyDeviceAdminReceiver',
                    'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION':
                      'https://locker.app.framekarts.com/app-arm64-v8a-release.apk',
                    'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM':
                      '3YQ6QrBNYCx_xiqJiMhF3MNy4-eAbPOZREz24kHOF9g',
                    'android.app.extra.PROVISIONING_SKIP_ENCRYPTION': true,
                  })}
                  size={220}
                />
              </View>

              <SubmitButton
                title="Done"
                onPress={() => {
                  handleModal('qr', false);
                  navigation.goBack();
                }}
                mainStyle={{ width: '100%', marginTop: 20 }}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </MainView>
  );
};

export default CreateLoan;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    marginHorizontal: SIZES.width * 0.05,
  },
  title: {
    fontSize: fontSize(30),
    fontFamily: FONTS.medium,
    marginBottom: SIZES.height * 0.03,
  },
  description: {
    fontSize: fontSize(15),
    width: SIZES.width * 0.8,
    marginBottom: SIZES.height * 0.05,
  },
  separator: {
    height: SIZES.height * 0.03,
  },
  button: {
    marginBottom: SIZES.height * 0.01,
    marginHorizontal: 'auto',
    marginVertical: 10,
  },
  installationTypeContainer: {
    backgroundColor: COLORS.lightBlack,
    padding: fontSize(15),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: fontSize(10),
    marginVertical: 10,
  },
  installationTypeTitle: {
    fontSize: fontSize(16),
    fontFamily: FONTS.medium,
  },
  radioButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  radioButton: {
    width: fontSize(18),
    height: fontSize(18),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: fontSize(10),
    height: fontSize(10),
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  autoUnlockContainer: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: fontSize(10),
    borderRadius: fontSize(10),
    backgroundColor: COLORS.lightBlack,
    paddingHorizontal: fontSize(20),
  },
  autoUnlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoUnlockTitle: {
    fontSize: fontSize(16),
    fontFamily: FONTS.medium,
  },
  switchContainer: {
    width: fontSize(50),
    height: fontSize(25),
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: fontSize(5),
  },
  switchThumb: {
    backgroundColor: COLORS.white,
    width: fontSize(20),
    height: fontSize(20),
    borderRadius: 20,
  },
  autoUnlockDescription: {
    fontSize: fontSize(15),
    color: COLORS.borderLight,
  },
  policyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 20,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    width: 20,
    height: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  policyText: {
    color: COLORS.borderLight,
  },
  termsText: {
    color: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.lightBlack,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: fontSize(20),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: fontSize(14),
    color: COLORS.borderLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
});
