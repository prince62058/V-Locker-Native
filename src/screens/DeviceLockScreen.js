import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DeviceLockScreen = () => {
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

  const openDialer = () => {
    Linking.openURL('tel:+919876543210'); // Replace with actual support number
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🔒</Text>
        </View>
        <Text style={styles.title}>DEVICE LOCKED</Text>
        <Text style={styles.subtitle}>Please Pay Your EMI</Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Your device has been locked because your EMI is OVERDUE. Please pay
            your outstanding dues immediately to restore access.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={openDialer}>
          <Text style={styles.buttonText}>CONTACT SUPPORT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ID: {Math.floor(Math.random() * 1000000)}
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
  warningBox: {
    backgroundColor: '#FFE5E5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  warningText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#B00020',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
