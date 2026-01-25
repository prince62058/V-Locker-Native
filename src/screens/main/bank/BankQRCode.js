import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Share,
  Platform,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import MainView from '../../../components/MainView';
import CustomHeader from '../../../components/header/CustomHeader';
import MainText from '../../../components/MainText';
import SubmitButton from '../../../components/common/button/SubmitButton';
import { COLORS, FONTS, SIZES } from '../../../constants';
import { fontSize } from '../../../utils/fontSize';

const BankQRCode = ({ navigation, route }) => {
  const { bankData } = route.params;
  const [qrRef, setQrRef] = useState(null);

  // Generate UPI payment string
  const generateUPIString = () => {
    if (!bankData?.upiId) return '';

    // UPI payment format: upi://pay?pa=UPI_ID&pn=NAME&cu=INR
    const upiString = `upi://pay?pa=${bankData.upiId}&pn=${encodeURIComponent(
      bankData.accountHolderName,
    )}&cu=INR`;

    return upiString;
  };

  const handleShare = async () => {
    try {
      const message = `Pay to: ${bankData.accountHolderName}\nUPI ID: ${bankData.upiId}\nBank: ${bankData.bankName}\nAccount: ${bankData.accountNumber}`;

      await Share.share({
        message: message,
        title: 'Payment Details',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const upiString = generateUPIString();

  return (
    <MainView transparent={false}>
      <CustomHeader title="Payment QR Code" back />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <MainText style={styles.title}>Scan to Pay</MainText>
          <MainText style={styles.subtitle}>
            Scan this QR code with any UPI app to make payment
          </MainText>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            {upiString ? (
              <QRCode
                value={upiString}
                size={SIZES.width * 0.6}
                color={COLORS.black}
                backgroundColor={COLORS.white}
                getRef={ref => setQrRef(ref)}
              />
            ) : (
              <MainText style={styles.errorText}>UPI ID not available</MainText>
            )}
          </View>

          {/* Bank Details */}
          <View style={styles.detailsContainer}>
            <DetailRow
              label="Account Holder"
              value={bankData.accountHolderName}
            />
            <DetailRow label="Bank Name" value={bankData.bankName} />
            <DetailRow label="Account Number" value={bankData.accountNumber} />
            <DetailRow label="IFSC Code" value={bankData.ifscCode} />
            {bankData.upiId && (
              <DetailRow label="UPI ID" value={bankData.upiId} highlight />
            )}
          </View>

          {/* Share Button */}
          <SubmitButton
            title="Share Payment Details"
            onPress={handleShare}
            mainStyle={styles.button}
          />
        </View>
      </ScrollView>
    </MainView>
  );
};

const DetailRow = ({ label, value, highlight }) => (
  <View style={styles.detailRow}>
    <MainText style={styles.detailLabel}>{label}:</MainText>
    <MainText style={[styles.detailValue, highlight && styles.highlightValue]}>
      {value}
    </MainText>
  </View>
);

export default BankQRCode;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SIZES.height * 0.02,
  },
  container: {
    flex: 1,
    marginHorizontal: SIZES.width * 0.05,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize(28),
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginTop: SIZES.height * 0.02,
  },
  subtitle: {
    fontSize: fontSize(14),
    fontFamily: FONTS.regular,
    textAlign: 'center',
    color: COLORS.borderLight,
    marginTop: SIZES.height * 0.01,
    marginBottom: SIZES.height * 0.03,
  },
  qrContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.width * 0.08,
    borderRadius: 20,
    marginVertical: SIZES.height * 0.02,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorText: {
    fontSize: fontSize(16),
    color: COLORS.red,
    textAlign: 'center',
    padding: SIZES.width * 0.1,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: COLORS.lightBlack,
    borderRadius: 12,
    padding: SIZES.width * 0.05,
    marginTop: SIZES.height * 0.02,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  detailRow: {
    marginBottom: SIZES.height * 0.015,
  },
  detailLabel: {
    fontSize: fontSize(12),
    color: COLORS.borderLight,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: fontSize(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  highlightValue: {
    color: COLORS.primary,
  },
  button: {
    marginTop: SIZES.height * 0.03,
    marginBottom: SIZES.height * 0.01,
    marginHorizontal: 'auto',
  },
});
