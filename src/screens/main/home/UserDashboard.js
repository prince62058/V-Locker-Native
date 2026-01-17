import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import MainView from '../../../components/MainView';
import CustomHeader from '../../../components/header/CustomHeader';
import MainText from '../../../components/MainText';
import { useSelector, useDispatch } from 'react-redux';
import { getHomeThunk } from '../../../redux/slices/main/homeSlice';
import moment from 'moment';

import { fontSize } from '../../../utils/fontSize';
import { COLORS, FONTS, SIZES } from '../../../constants';

const UserDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const { homeData } = useSelector(state => state.home);
  // console.log('Home Data:', homeData);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getHomeThunk());
  }, [dispatch]);

  return (
    <MainView>
      <CustomHeader title={'My Dashboard'} />
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
                  ₹ {homeData?.amount ? String(homeData.amount) : '0'}
                </MainText>
              </View>
              <View style={[styles.row, { marginTop: 10 }]}>
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
        <View style={[styles.card, { marginTop: 20 }]}>
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
        </View>
      </View>
    </MainView>
  );
};

export default UserDashboard;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  welcome: {
    fontSize: fontSize(22),
    fontFamily: FONTS.bold,
    marginBottom: 20,
    color: COLORS.black,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    elevation: 4,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: fontSize(18),
    fontFamily: FONTS.semiBold,
    marginBottom: 10,
    color: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
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
    marginTop: 5,
  },
  placeholder: {
    marginTop: 40,
    alignItems: 'center',
  },
});
