import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  StatusBar,
  DeviceEventEmitter,
  ScrollView,
  NativeModules,
  Alert,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import { BASE_API_URL } from '../services/axios/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import { getPublicMobileStatusThunk } from '../redux/slices/main/loanSlice';
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { KioskModule } = NativeModules;

const DeviceLockScreen = () => {
  const dispatch = useDispatch();
  const [emiAmount, setEmiAmount] = useState(null);
  const [loanId, setLoanId] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '' });
  const [deviceImei, setDeviceImei] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [shopName, setShopName] = useState('Satya Kabir E-solutions Pvt. Ltd.');

  // Disable Back Button & Enable Kiosk Mode
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    // Enable Kiosk Mode (Pin App)
    if (KioskModule && KioskModule.enableKioskMode) {
      KioskModule.enableKioskMode()
        .then(() => console.log('Kiosk Mode Enabled via JS'))
        .catch(err => console.error('Kiosk Mode Error:', err));
    }

    return () => {
      backHandler.remove();
    };
  }, []);

  // Fetch Device Status & Due Amount
  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        setLoading(true);

        // PRIORITY 1: Provisioned IMEI (Soft-Bind)
        let id = null;
        try {
          if (KioskModule && KioskModule.getProvisionedImei) {
            id = await KioskModule.getProvisionedImei();
            if (id)
              console.log('DeviceLockScreen: Using Provisioned IMEI:', id);
          }
        } catch (e) {
          console.log('Error getting provisioned IMEI:', e);
        }

        // PRIORITY 2: Device Unique ID
        if (!id) {
          id = await DeviceInfo.getUniqueId();
        }

        setDeviceImei(id);

        const storedPhone = await AsyncStorage.getItem('vlocker_user_phone');
        console.log(
          'DeviceLockScreen: Fetching for ID:',
          id,
          'Phone Fallback:',
          storedPhone,
          'isEmulator:',
          await DeviceInfo.isEmulator(),
        );
        const result = await dispatch(
          getPublicMobileStatusThunk({ imei: id, phone: storedPhone || '' }),
        ).unwrap();

        if (result) {
          // Check for 'loan' object or 'data' object in response
          const loan = result.loan || result.data;

          if (loan) {
            const amountToShow =
              loan.totalDueAmount > 0
                ? loan.totalDueAmount
                : loan.emiAmount || loan.monthlyEmi || 0;

            console.log(
              'DeviceLockScreen: Amount to show:',
              amountToShow,
              'from loan:',
              loan._id,
            );
            setEmiAmount(amountToShow);
            setLoanId(loan._id);
            setCustomerInfo({
              name: loan.customerId?.customerName || 'Customer',
              email: loan.customerId?.customerEmail || 'customer@vlocker.com',
            });
            setShopName(loan.shopName || 'Satya Kabir E-solutions Pvt. Ltd.');
          } else {
            console.log('DeviceLockScreen: No loan data found in result');
          }
        }
      } catch (error) {
        console.error('Error fetching loan data (offline):', error);
        // If error/offline, we still keep the screen red and locked.
        // We could show a specific offline message if we want.
      } finally {
        setLoading(false);
      }
    };

    fetchLoanData();

    const interval = setInterval(() => {
      fetchLoanData();
      DeviceEventEmitter.emit('LOCK_STATUS_CHANGED', { status: 'LOCKED' });
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handlePayment = async () => {
    if (!loanId || emiAmount <= 0) {
      Alert.alert('Error', 'Invalid loan data or amount. Please try again.');
      return;
    }

    try {
      setPaymentLoading(true);

      // 1. Create Order on Backend
      const orderResponse = await axios.post(
        `${BASE_API_URL}payment/create-order`,
        {
          loanId: loanId,
        },
      );

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create order');
      }

      const orderData = orderResponse.data.order;

      // 2. Open Razorpay Checkout
      const options = {
        description: 'EMI Payment',
        image: 'https://vlocker.app/logo.png', // Replace with actual logo
        currency: 'INR',
        key: 'rzp_test_S8rAkegpLCFP7n',
        amount: orderData.amount,
        name: 'V-Locker',
        order_id: orderData.id,
        prefill: {
          email: customerInfo.email,
          contact: '', // Optional
          name: customerInfo.name,
        },
        theme: { color: '#B00020' },
      };

      RazorpayCheckout.open(options)
        .then(async data => {
          // 3. Verify Payment on Backend
          const verifyResponse = await axios.post(
            `${BASE_API_URL}payment/verify-payment`,
            {
              razorpay_order_id: data.razorpay_order_id,
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_signature: data.razorpay_signature,
              loanId: loanId,
            },
          );

          if (verifyResponse.data.success) {
            Alert.alert(
              'Success',
              'Payment verified successfully! Your device will unlock shortly.',
            );
            // Refresh logic will take care of unlocking
          } else {
            Alert.alert('Payment Failure', 'Verification failed on server.');
          }
        })
        .catch(error => {
          console.log('Razorpay Error:', error);
          if (error.code !== 2) {
            // Check for user cancellation (code 2)
            let displayMessage = '';

            if (typeof error === 'object' && error !== null) {
              const description =
                error.description ||
                (error.error && typeof error.error === 'object'
                  ? error.error.description
                  : null);

              if (
                description &&
                description !== 'undefined' &&
                typeof description === 'string'
              ) {
                displayMessage = description;
              } else if (error.reason && typeof error.reason === 'string') {
                displayMessage = error.reason.replace(/_/g, ' ');
              }
            }

            // Fallback if no clean message was found or if it looks like technical output
            if (
              !displayMessage ||
              displayMessage.includes('{') ||
              displayMessage.toLowerCase() === 'undefined'
            ) {
              displayMessage = 'Payment failed. Please try again.';
            }

            // Capitalize first letter
            displayMessage =
              displayMessage.charAt(0).toUpperCase() + displayMessage.slice(1);

            Alert.alert('Payment Status', displayMessage);
          }
        });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Error processing payment';
      Alert.alert('Error', errorMsg);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const phone = '916205872519';
    const message = `Hello, my device (IMEI: ${deviceImei}) is locked. I want to pay my EMI of ₹${emiAmount}.`;
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${message}`).catch(
      () => {
        Linking.openURL(`https://wa.me/${phone}?text=${message}`);
      },
    );
  };

  const handleCall = () => {
    Linking.openURL('tel:6205872519');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:princekumar5252@gmail.com');
  };

  const handleOpenWifi = () => {
    if (KioskModule && KioskModule.openWifiSettings) {
      KioskModule.openWifiSettings();
    }
  };

  const handleOpenMobileData = () => {
    if (KioskModule && KioskModule.openMobileDataSettings) {
      KioskModule.openMobileDataSettings();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#B00020"
        barStyle="light-content"
        hidden={true}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Icon */}
        <View style={styles.header}>
          <View style={styles.lockIconCircle}>
            <Ionicons name="lock-closed" size={50} color="#fff" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>DEVICE LOCKED</Text>
        <Text style={styles.subtitle}>Please Pay Your EMI</Text>

        {/* EMI Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>EMI Due Amount</Text>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#B00020"
              style={{ marginTop: 10 }}
            />
          ) : (
            <Text style={styles.amountValue}>₹{emiAmount ?? '---'}</Text>
          )}
        </View>

        {/* Warning Message */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Your device has been locked because your EMI is OVERDUE. Please pay
            your outstanding dues immediately to restore access.
          </Text>
        </View>

        {/* Company Branding */}
        <View style={styles.brandingContainer}>
          <Text style={styles.companyName}>{shopName}</Text>
          <Text style={styles.companyTagline}>
            IT Software & Digital Marketing Agency
          </Text>
        </View>

        {/* Customer Support */}
        <View style={styles.supportContainer}>
          <Text style={styles.sectionTitle}>Customer Support</Text>

          <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>6205872519</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="email" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>princekumar5252@gmail.com</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Network Access */}
        <View style={styles.supportContainer}>
          <Text style={styles.sectionTitle}>Internet & Network</Text>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <TouchableOpacity
              style={styles.networkButton}
              onPress={handleOpenWifi}
            >
              <Ionicons name="wifi" size={24} color="#B00020" />
              <Text style={styles.networkButtonText}>WiFi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.networkButton}
              onPress={handleOpenMobileData}
            >
              <Ionicons name="cellular" size={24} color="#B00020" />
              <Text style={styles.networkButtonText}>Data</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.smallInfo}>
            Use these buttons to connect to the internet to pay and unlock.
          </Text>
        </View>

        {/* Footer Info */}
        <Text style={styles.footerInfo}>
          Device IMEI: {deviceImei || 'Loading...'}
        </Text>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.payNowButton}
          onPress={handlePayment}
          disabled={paymentLoading}
        >
          {paymentLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons
                name="payment"
                size={24}
                color="#fff"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.whatsappButtonText}>PAY NOW</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
    alignItems: 'center',
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  lockIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#B00020',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B00020',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
  },
  amountCard: {
    backgroundColor: '#FFE5E5',
    width: '90%',
    padding: 25,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#B00020',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#B00020',
  },
  warningBox: {
    width: '90%',
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  warningText: {
    color: '#D32F2F',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  companyTagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginLeft: 5,
  },
  supportContainer: {
    width: '90%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
  },
  contactValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  footerInfo: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  payNowButton: {
    backgroundColor: '#B00020',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  networkButton: {
    flex: 0.48,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#B00020',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkButtonText: {
    color: '#B00020',
    fontWeight: 'bold',
    marginTop: 5,
  },
  smallInfo: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default DeviceLockScreen;
