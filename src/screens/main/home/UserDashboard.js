import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  NativeModules,
} from 'react-native';
import EMIReminder from '../../../services/EMIReminder';
import React, { useEffect, useState } from 'react';
import MainView from '../../../components/MainView';
import MainText from '../../../components/MainText';
import { useSelector, useDispatch } from 'react-redux';
import { getHomeThunk } from '../../../redux/slices/main/homeSlice';
import { logoutThunk } from '../../../redux/slices/auth/authSlice';
import moment from 'moment';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import {
  fontSize,
  scale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import { COLORS, FONTS, SIZES } from '../../../constants';

const UserDashboard = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const { homeData } = useSelector(state => state.home);

  const dispatch = useDispatch();

  useEffect(() => {
    // Initial fetch
    dispatch(getHomeThunk());

    // Poll every 10 seconds for real-time updates
    const intervalId = setInterval(() => {
      dispatch(getHomeThunk());
    }, 10000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  const { KioskModule } = NativeModules;

  // Manage EMI Reminders
  useEffect(() => {
    if (homeData) {
      if (homeData.status === 'Paid') {
        EMIReminder.stopReminder();
      } else if (homeData.nextDueDate && homeData.nextDueDate !== 'N/A') {
        // Schedule reminder for the due date
        // format is likely ISO or a string moment can parse.
        // EMIReminder.scheduleReminder expects a timestamp or Date object.
        const dueDate = moment(homeData.nextDueDate).toDate();
        // Check if valid date
        if (!isNaN(dueDate.getTime())) {
          EMIReminder.scheduleReminder(dueDate);
        }
      }
    }
  }, [homeData]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => dispatch(logoutThunk()),
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  };

  const handleUninstall = () => {
    Alert.alert(
      'Uninstall Application',
      'Are you sure? This will Disable Kiosk Mode and allow you to Uninstall the app from Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              await KioskModule.setFactoryResetAllowed(true);
              await KioskModule.setUninstallAllowed(true);
              await KioskModule.disableKioskMode();
              Alert.alert(
                'Success',
                'Kiosk Mode Disabled. You can now uninstall the app from Settings.',
              );
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to disable security: ' + error.message,
              );
            }
          },
        },
      ],
    );
  };

  return (
    <MainView transparent={false}>
      {/* Header with Logout Button */}
      <View style={styles.header}>
        <MainText style={styles.headerTitle}>My Dashboard</MainText>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <MainText style={styles.welcome}>
          Welcome, {user?.name || 'Customer'}
        </MainText>

        {/* EMI Details Card */}
        {homeData?.isCustomer && homeData?.status ? (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <MainText style={styles.cardTitle}>EMI Status</MainText>
              <View style={styles.row}>
                <MainText style={styles.label}>Next Due Date:</MainText>
                <MainText style={styles.value}>
                  {homeData?.nextDueDate !== 'N/A'
                    ? moment(homeData?.nextDueDate).format('MMM DD, YYYY')
                    : 'N/A'}
                </MainText>
              </View>
              <View style={styles.row}>
                <MainText style={styles.label}>Amount:</MainText>
                <MainText style={styles.value}>
                  {`₹ ${homeData?.amount ? homeData.amount : '0'}`}
                </MainText>
              </View>
              <View style={[styles.row, { marginTop: verticalScale(10) }]}>
                <MainText style={styles.label}>Status:</MainText>
                <MainText
                  style={[
                    styles.value,
                    {
                      color:
                        homeData?.status === 'Overdue' ||
                        homeData?.status === 'LOCKED'
                          ? COLORS.error
                          : COLORS.success,
                    },
                  ]}
                >
                  {homeData?.status}
                </MainText>
              </View>

              {/* View Full Details Button */}
              <TouchableOpacity
                style={{
                  marginTop: verticalScale(15),
                  backgroundColor: COLORS.primary,
                  padding: moderateScale(10),
                  borderRadius: moderateScale(8),
                  alignItems: 'center',
                }}
                onPress={() => {
                  console.log('HomeData on Button Press:', homeData);
                  if (homeData?.loanId) {
                    navigation.navigate('LoanInfo', {
                      loanId: homeData.loanId,
                      initialTab: 'Installments',
                    });
                  } else {
                    console.warn('Loan ID missing in homeData');
                    Alert.alert(
                      'Error',
                      'Loan Details not found. Please pull to refresh.',
                    );
                  }
                }}
              >
                <MainText
                  style={{
                    color: COLORS.white,
                    fontFamily: FONTS.bold,
                    fontSize: fontSize(14),
                  }}
                >
                  View Installments Only
                </MainText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <MainText style={styles.info}>No Active Loan Found</MainText>
            </View>
          </View>
        )}

        {/* Notifications Summary */}
        <View style={[styles.card, { marginTop: verticalScale(20) }]}>
          <View style={styles.cardContent}>
            <MainText style={styles.cardTitle}>Recent Notifications</MainText>
            <MainText style={styles.info}>
              {homeData?.notification || 'No new notifications.'}
            </MainText>
          </View>
        </View>

        {/* Placeholder for other details */}
        <View style={styles.placeholder}>
          <MainText style={styles.info}>
            Contact your shop for more details.
          </MainText>

          {/* Admin/Employee/Policy Uninstall Option */}
          {(user?.role === 'admin' ||
            homeData?.devicePolicy?.isUninstallAllowed) && (
            <TouchableOpacity
              style={[
                styles.logoutButton,
                {
                  backgroundColor: COLORS.error,
                  padding: moderateScale(15),
                  borderRadius: moderateScale(10),
                  marginTop: verticalScale(30),
                  width: '100%',
                  alignItems: 'center',
                },
              ]}
              onPress={handleUninstall}
            >
              <MainText style={{ color: COLORS.white, fontFamily: FONTS.bold }}>
                Uninstall Application
              </MainText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </MainView>
  );
};

export default UserDashboard;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: scale(20),
    height: verticalScale(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.black,
  },
  headerTitle: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: fontSize(16),
  },
  logoutButton: {
    padding: 4,
  },
  container: {
    padding: moderateScale(20),
  },
  welcome: {
    fontSize: fontSize(22),
    fontFamily: FONTS.bold,
    marginBottom: verticalScale(20),
    color: COLORS.black,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    elevation: 4,
    marginBottom: verticalScale(10),
    borderColor: '#ddd',
    borderWidth: 1,
  },
  cardContent: {
    padding: moderateScale(15),
  },
  cardTitle: {
    fontSize: fontSize(18),
    fontFamily: FONTS.semiBold,
    marginBottom: verticalScale(10),
    color: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(5),
  },
  label: {
    fontFamily: FONTS.medium,
    color: COLORS.textGray,
  },
  value: {
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  info: {
    fontSize: fontSize(14),
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
    marginTop: verticalScale(5),
  },
  placeholder: {
    marginTop: verticalScale(40),
    alignItems: 'center',
  },
});
