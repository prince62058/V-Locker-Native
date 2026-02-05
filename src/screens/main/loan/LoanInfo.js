import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import SubmitButton from '../../../components/common/button/SubmitButton';
import CustomView from '../../../components/customView';
import DetailsCard from '../../../components/detailsCard';
import CustomHeader from '../../../components/header/CustomHeader';
import InstallmentCard from '../../../components/installmentsCard';
import MainText from '../../../components/MainText';
import MainView from '../../../components/MainView';
import { COLORS, FONTS, icons, SIZES } from '../../../constants';
import { getLoanDetailsThunk } from '../../../redux/slices/main/loanSlice';
import { fontSize } from '../../../utils/fontSize';

const LoanInfo = ({ navigation, route }) => {
  const { loanId, initialTab } = route.params || {};

  const dispatch = useDispatch();
  const {
    loanData,
    loading,
    pagination,
    loanDetails,
    searchData,
    searchPagination,
  } = useSelector(state => state.loan);
  const { user } = useSelector(state => state.auth);
  console.log('Loan details ---> ', loanDetails);
  console.log('Loan Info Screen Rendered with long prop');

  /* 
     If user is NOT admin, force 'Installments' view and hide toggle.
     If user IS admin, show toggle and respect initialTab or default to 'details'.
  */
  const isCustomer = user?.role !== 'admin';

  // Set initial state based on role
  const [activeToggle, setActiveToggle] = useState(
    isCustomer ? 'Installments' : initialTab || 'details',
  );

  // Effect to enforce Installments for customers if somehow changed
  useEffect(() => {
    if (isCustomer && activeToggle !== 'Installments') {
      setActiveToggle('Installments');
    }
  }, [isCustomer, activeToggle]);

  const fetchData = useCallback(
    ({ isRefresh = false }) => {
      dispatch(getLoanDetailsThunk({ isRefresh, loanId }));
    },
    [dispatch, loanId],
  );

  useEffect(() => {
    fetchData({});
  }, [loanId]);

  const onRefresh = useCallback(() => {
    fetchData({ isRefresh: true });
  }, [fetchData]);

  const handleApprove = () => {
    const { Alert } = require('react-native');
    Alert.alert(
      'Are you Sure?',
      'Are you sure you want to Approve this loan?',
      [
        {
          text: 'NO',
          style: 'cancel',
        },
        {
          text: 'Approve',
          onPress: async () => {
            const {
              updateLoanThunk,
            } = require('../../../redux/slices/main/loanSlice');
            try {
              await dispatch(
                updateLoanThunk({
                  id: loanDetails?._id,
                  data: { loanStatus: 'APPROVED' },
                }),
              ).unwrap();

              // Navigate to QR Screen logic
              navigation.navigate('CustomerQr');
            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
    );
  };

  const handleReject = () => {
    const { Alert } = require('react-native');
    Alert.alert('Reject Loan', 'Are you sure you want to Reject this loan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        onPress: async () => {
          const {
            updateLoanThunk,
          } = require('../../../redux/slices/main/loanSlice');
          await dispatch(
            updateLoanThunk({
              id: loanDetails?._id,
              data: { loanStatus: 'REJECTED' },
            }),
          );
          navigation.goBack();
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <MainView transparent={false}>
      <CustomHeader title="Loan Info" back />

      <View style={styles.mainStyle}>
        {!isCustomer && (
          <View style={styles.toggleButton}>
            <Pressable
              style={[
                styles.textView,
                {
                  backgroundColor:
                    activeToggle == 'details' ? COLORS.primary : null,
                },
              ]}
              onPress={() => setActiveToggle('details')}
            >
              <MainText style={styles.toggleText}>Details</MainText>
            </Pressable>
            <Pressable
              style={[
                styles.textView,
                {
                  backgroundColor:
                    activeToggle == 'Installments' ? COLORS.primary : null,
                },
              ]}
              onPress={() => setActiveToggle('Installments')}
            >
              <MainText style={styles.toggleText}>Installments</MainText>
            </Pressable>
          </View>
        )}

        {activeToggle == 'details' ? (
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{ paddingBottom: SIZES.height * 0.18 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={loading?.refreshing}
                  onRefresh={onRefresh}
                />
              }
            >
              <DetailsCard
                long
                item={loanDetails}
                onPress={() =>
                  navigation.navigate('CreateLoan', {
                    customerId: loanDetails?.customerId?._id,
                    loanId: loanDetails?._id,
                    isEdit: true,
                  })
                }
              />
              <View style={styles.View}>
                <View style={styles.flex}>
                  <Image source={icons.user} style={styles.userIcon} />
                  <MainText style={styles.heading}>Customer Details</MainText>
                </View>

                <CustomView
                  label1="Name"
                  value1={loanDetails?.customerId?.customerName}
                  label2="Mobile Number"
                  value2={loanDetails?.customerId?.customerMobileNumber}
                />
                <CustomView
                  label1="Address:"
                  value1={loanDetails?.customerId?.address}
                  label2="Status:"
                  value2={loanDetails?.customerId?.isVerified}
                />

                <SubmitButton
                  title="View Details"
                  onPress={() => navigation.navigate('ViewCustomer')}
                  mainStyle={{
                    marginHorizontal: 0,
                    width: '100%',
                    marginTop: 10,
                    height: fontSize(50),
                  }}
                />

                {user?.role === 'admin' && (
                  <SubmitButton
                    title="Delete Loan"
                    onPress={() => {
                      const { Alert } = require('react-native');
                      Alert.alert(
                        'Delete Loan',
                        'Are you sure you want to delete this loan?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Delete',
                            onPress: async () => {
                              const {
                                deleteLoanThunk,
                              } = require('../../../redux/slices/main/loanSlice');
                              await dispatch(
                                deleteLoanThunk({ id: loanDetails?._id }),
                              );
                              navigation.goBack();
                            },
                            style: 'destructive',
                          },
                        ],
                      );
                    }}
                    mainStyle={{
                      marginHorizontal: 0,
                      width: '100%',
                      marginTop: 10,
                      height: fontSize(50),
                      backgroundColor: COLORS.red,
                    }}
                  />
                )}
              </View>
            </ScrollView>

            {/* APPROVE / REJECT BUTTONS */}
            {loanDetails?.loanStatus === 'PENDING' &&
              user?.role === 'admin' && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                    paddingHorizontal: 10,
                  }}
                >
                  <SubmitButton
                    title="Reject"
                    onPress={handleReject}
                    mainStyle={{
                      width: '45%',
                      backgroundColor: COLORS.lightBlack, // or 'transparent' with border if needed
                      marginHorizontal: 0,
                    }}
                    textStyle={{ color: COLORS.white }}
                  />
                  <SubmitButton
                    title="Approve"
                    onPress={handleApprove}
                    mainStyle={{
                      width: '45%',
                      backgroundColor: '#799F05', // Match the green color from screenshot
                      marginHorizontal: 0,
                    }}
                  />
                </View>
              )}
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={loanDetails?.installments}
            keyExtractor={item => item._id}
            renderItem={({ item, index }) => (
              <InstallmentCard
                item={item}
                index={index}
                date={item.date}
                installId={item.installId}
                cash={item.cash}
                status={item.status}
              />
            )}
            contentContainerStyle={{ paddingBottom: SIZES.height * 0.15 }}
            refreshControl={
              <RefreshControl
                refreshing={loading?.refreshing}
                onRefresh={onRefresh}
              />
            }
          />
        )}
      </View>
    </MainView>
  );
};

export default LoanInfo;

const styles = StyleSheet.create({
  mainStyle: {
    flex: 1,
    marginHorizontal: SIZES.width * 0.05,
  },
  toggleButton: {
    borderWidth: 2,
    borderColor: '#B9B9B9',
    borderRadius: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: SIZES.width * 0.9,
    height: SIZES.height * 0.06,
    marginBottom: fontSize(5),
  },
  textView: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 120,
    marginHorizontal: SIZES.width * 0.001,
    width: SIZES.width * 0.43,
    height: SIZES.height * 0.048,
  },
  toggleText: {
    fontSize: fontSize(20),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  View: {
    width: SIZES.width * 0.9,
    elevation: 4,
    borderRadius: SIZES.h4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SIZES.width * 0.04,
    paddingVertical: SIZES.height * 0.0125,
    marginVertical: SIZES.height * 0.002,
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    height: SIZES.width * 0.05,
    width: SIZES.width * 0.05,
    resizeMode: 'contain',
    marginRight: SIZES.width * 0.005,
  },
  heading: {
    marginLeft: SIZES.width * 0.01,
    fontSize: fontSize(16),
    fontFamily: FONTS.bold,
    color: '#559EF0',
  },
});
