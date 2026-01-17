import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import MainView from '../../../components/MainView';
import CustomHeader from '../../../components/header/CustomHeader';
import MainText from '../../../components/MainText';
import { useSelector, useDispatch } from 'react-redux';
import { getHomeThunk } from '../../../redux/slices/main/homeSlice';
import { logoutThunk } from '../../../redux/slices/auth/authSlice';
import moment from 'moment';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';

import { fontSize } from '../../../utils/fontSize';
import { COLORS, FONTS, SIZES } from '../../../constants';

const UserDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const { homeData } = useSelector(state => state.home);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getHomeThunk());
  }, [dispatch]);

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

  return (
    <MainView>
      {/* Custom Header with Logout Button */}
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
        {/* Welcome Section with Gradient */}
        <LinearGradient
          colors={[COLORS.primary, '#5856D6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
        >
          <MainText style={styles.welcomeText}>Welcome Back! 👋</MainText>
          <MainText style={styles.userName}>
            {user?.name || 'Customer'}
          </MainText>
        </LinearGradient>

        {/* EMI Details Card */}
        {homeData?.isCustomer && homeData?.status ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="card-outline" size={24} color={COLORS.primary} />
              <MainText style={styles.cardTitle}>EMI Status</MainText>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.row}>
                <View style={styles.infoItem}>
                  <MainText style={styles.label}>Next Due Date</MainText>
                  <MainText style={styles.value}>
                    {homeData?.nextDueDate !== 'N/A'
                      ? moment(homeData?.nextDueDate).format('MMM DD, YYYY')
                      : 'N/A'}
                  </MainText>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.infoItem}>
                  <MainText style={styles.label}>Amount Due</MainText>
                  <MainText style={[styles.value, styles.amountText]}>
                    ₹ {homeData?.amount ? String(homeData.amount) : '0'}
                  </MainText>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.infoItem}>
                  <MainText style={styles.label}>Status</MainText>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          homeData?.status === 'Overdue' ||
                          homeData?.status === 'LOCKED'
                            ? '#FFE5E5'
                            : '#E8F5E9',
                      },
                    ]}
                  >
                    <MainText
                      style={[
                        styles.statusText,
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
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.emptyState}>
              <Ionicons
                name="information-circle-outline"
                size={48}
                color={COLORS.textGray}
              />
              <MainText style={styles.emptyText}>No Active Loan Found</MainText>
              <MainText style={styles.emptySubtext}>
                Contact your shop for more details
              </MainText>
            </View>
          </View>
        )}

        {/* Notifications Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.primary}
            />
            <MainText style={styles.cardTitle}>Recent Notifications</MainText>
          </View>
          <View style={styles.cardContent}>
            <MainText style={styles.notificationText}>
              {homeData?.notification || 'No new notifications.'}
            </MainText>
          </View>
        </View>
      </View>
    </MainView>
  );
};

export default UserDashboard;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SIZES.width * 0.05,
    height: SIZES.height * 0.07,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.black,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: fontSize(18),
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  welcomeText: {
    fontSize: fontSize(16),
    fontFamily: FONTS.medium,
    color: COLORS.white,
    opacity: 0.9,
  },
  userName: {
    fontSize: fontSize(24),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    gap: 10,
  },
  cardTitle: {
    fontSize: fontSize(18),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    marginBottom: 4,
  },
  infoItem: {
    flex: 1,
  },
  label: {
    fontSize: fontSize(13),
    fontFamily: FONTS.medium,
    color: COLORS.textGray,
    marginBottom: 6,
  },
  value: {
    fontSize: fontSize(16),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  amountText: {
    fontSize: fontSize(20),
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: fontSize(14),
    fontFamily: FONTS.bold,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: fontSize(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textGray,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: fontSize(13),
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
    marginTop: 4,
    opacity: 0.7,
  },
  notificationText: {
    fontSize: fontSize(14),
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
    lineHeight: 20,
  },
});
