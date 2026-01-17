import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { getLoanListThunk } from '../redux/slices/main/loanSlice';

const DeviceLockScreen = () => {
  const dispatch = useDispatch();
  const [emiAmount, setEmiAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector(state => state.auth);

  // Disable Back Button
  useEffect(() => {
    const backAction = () => {
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  // Fetch EMI amount on mount
  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        setLoading(true);
        const result = await dispatch(
          getLoanListThunk({ page: 1, limit: 1 }),
        ).unwrap();

        if (result?.data && result.data.length > 0) {
          const loan = result.data[0];
          // Extract EMI amount from loan data
          setEmiAmount(loan.emiAmount || loan.monthlyEmi || 0);
        }
      } catch (error) {
        console.error('Error fetching loan data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanData();
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🔒</Text>
        </View>
        <Text style={styles.title}>DEVICE LOCKED</Text>
        <Text style={styles.subtitle}>Please Pay Your EMI</Text>

        {/* EMI Amount Display */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#B00020"
            style={styles.loader}
          />
        ) : (
          <View style={styles.emiContainer}>
            <Text style={styles.emiLabel}>EMI Due Amount</Text>
            <Text style={styles.emiAmount}>₹{emiAmount || '---'}</Text>
          </View>
        )}

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Your device has been locked because your EMI is OVERDUE. Please pay
            your outstanding dues immediately to restore access.
          </Text>
        </View>

        {/* Payment QR Code */}
        <View style={styles.qrContainer}>
          <Image
            source={require('../assets/images/payment_qr.jpg')}
            style={styles.qrImage}
            resizeMode="contain"
          />
          <Text style={styles.qrText}>Scan to Pay EMI</Text>
        </View>

        {/* Customer Support Number (View Only) */}
        <View style={styles.supportContainer}>
          <Text style={styles.supportLabel}>Customer Support</Text>
          <Text style={styles.supportNumber}>6205872519</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ID: {user?.customerId || Math.floor(Math.random() * 1000000)}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B00020', // Error Red
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconText: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B00020',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  emiContainer: {
    backgroundColor: '#FFE5E5',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B00020',
  },
  emiLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  emiAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#B00020',
  },
  warningBox: {
    backgroundColor: '#FFE5E5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  qrText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  supportContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    width: '100%',
  },
  supportLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  supportNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
});

export default DeviceLockScreen;
