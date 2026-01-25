import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MainView from '../../../components/MainView';
import CustomHeader from '../../../components/header/CustomHeader';
import { COLORS, FONTS, SIZES } from '../../../constants';
import QRCode from 'react-native-qrcode-svg';

const CustomerQr = ({ navigation }) => {
  // This JSON is what Android reads directly from the QR to fetch and set up the Admin App
  const provisioningPayload = JSON.stringify({
    'android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME':
      'com.vlocker/.MyDeviceAdminReceiver',
    'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION':
      'https://locker.app.framekarts.com/app-arm64-v8a-release.apk',
    'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM':
      'Mev7nBRNZ4tmvFKAAMcGRP0dpguQ2oPZn2JFfMBkGXE',
    'android.app.extra.PROVISIONING_SKIP_ENCRYPTION': true,
    'android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED': true,
    'android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE': {
      loader_id: '123456', // Optional: Pass Loan/Device ID here if needed
    },
  });

  return (
    <MainView transparent={false}>
      <CustomHeader title="Customer App QR" back />
      <View style={styles.container}>
        <View style={styles.qrContainer}>
          <Text style={styles.text}>
            Scan this QR Code on a NEW (Factory Reset) Device to make Vlocker
            the Owner.
          </Text>

          <View style={styles.qrWrapper}>
            <QRCode
              value={provisioningPayload}
              size={250}
              backgroundColor="white"
              color="black"
            />
          </View>

          <Text style={styles.warning}>
            * Note: This QR requires the APK to be hosted online.
          </Text>
        </View>
      </View>
    </MainView>
  );
};

export default CustomerQr;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SIZES.width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  text: {
    fontFamily: FONTS.medium,
    color: COLORS.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
  },
  warning: {
    fontSize: 12,
    color: COLORS.red,
    textAlign: 'center',
    marginTop: 10,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.gray, // Assuming gray exists, or use light gray hex
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
});
