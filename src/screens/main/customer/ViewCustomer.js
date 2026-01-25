import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AddButton from '../../../components/common/button/AddButton';
import Nodata from '../../../components/common/nodata/Nodata';
import CustomerCard from '../../../components/customerCard';
import DetailsCard from '../../../components/detailsCard';
import CustomHeader from '../../../components/header/CustomHeader';
import MainText from '../../../components/MainText';
import MainView from '../../../components/MainView';
import { COLORS, FONTS, icons, SIZES } from '../../../constants';
import { getCustomerProfileThunk } from '../../../redux/slices/main/customerSlice';
import { fontSize } from '../../../utils/fontSize';
import { getStatusStyle } from '../../../utils/getStyle';

const status = [
  { id: 1, status: 'Active' },
  { id: 2, status: 'Pending' },
  { id: 3, status: 'Rejected' },
  { id: 4, status: 'closed' },
  { id: 5, status: 'locked device' },
  { id: 6, status: 'Approved' },
];

const ViewCustomer = ({ navigation, route }) => {
  const { id } = route.params ?? {};
  // console.log('Params cusotmer id', id)

  const dispatch = useDispatch();
  const { customerProfile, loading } = useSelector(state => state.customer);
  // console.log('customer profile ', customerProfile)

  const [activeToggle, setActiveToggle] = useState('loans');
  const [selectedStatus, setSelectedStatus] = useState('Active');

  const fetchData = useCallback(
    ({ isRefresh = false, page = 1, search = '' }) => {
      dispatch(getCustomerProfileThunk({ customerId: id }));
    },
    [dispatch],
  );

  useEffect(() => {
    if (!id) return;
    fetchData({});
  }, [fetchData, id]);

  const onRefresh = useCallback(() => {
    fetchData({ isRefresh: true });
  }, [fetchData]);

  const filteredLoans =
    customerProfile?.Loan?.filter(item => {
      switch (selectedStatus) {
        case 'Active':
          return item.loanStatus === 'APPROVED';
        case 'Pending':
          return item.loanStatus === 'PENDING';
        case 'Rejected':
          return item.loanStatus === 'REJECTED';
        case 'closed':
          return item.loanStatus === 'CLOSED';
        case 'locked device':
          return item.deviceUnlockStatus === 'LOCKED';
        case 'Approved':
          return item.loanStatus === 'APPROVED';
        default:
          return true;
      }
    }) || [];

  const PressableView = ({ title, onPress }) => {
    return (
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{title} </Text>
        <View style={styles.plusView}>
          <Image style={styles.plusIcon} source={icons.plus} />
        </View>
      </Pressable>
    );
  };

  const handleAddPress = () => {
    navigation.navigate('CreateLoan', { customerId: id });
  };
  const handleEditCustomer = () => {
    navigation.navigate('EditCustomer', { customerId: id });
  };

  const handleCardPress = item => {
    navigation.navigate('LoanInfo', { loanId: item?._id });
  };

  return (
    <MainView transparent={false}>
      <CustomHeader title="Customer Details" back />

      <View style={styles.mainStyle}>
        <CustomerCard
          name={customerProfile?.customerName}
          phone={customerProfile?.customerMobileNumber}
          location={customerProfile?.address}
          activeLoans={customerProfile?.activeLoans}
          status={customerProfile?.isVerified}
          showCustomerId={false}
          showDeleteButton={false}
          icon={true}
          onEdit={handleEditCustomer}
          profile={customerProfile?.profileUrl}
        />

        <View style={styles.toggleButton}>
          <Pressable
            style={styles.textView}
            onPress={() => setActiveToggle('loans')}
          >
            <MainText style={styles.toggleText}>Loans</MainText>
            <View
              style={[
                styles.activeIndicator,
                {
                  backgroundColor:
                    activeToggle === 'loans' ? COLORS.primary : COLORS.border,
                },
              ]}
            />
          </Pressable>

          <Pressable
            style={styles.textView}
            onPress={() => setActiveToggle('documents')}
          >
            <MainText style={styles.toggleText}>Documents</MainText>
            <View
              style={[
                styles.activeIndicator,
                {
                  backgroundColor:
                    activeToggle === 'documents'
                      ? COLORS.primary
                      : COLORS.border,
                },
              ]}
            />
          </Pressable>
        </View>
      </View>

      {activeToggle === 'loans' && (
        <View>
          <FlatList
            data={status}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => {
              const statusStyle = getStatusStyle(item.status);
              const isSelected = selectedStatus === item.status;
              return (
                <Pressable
                  onPress={() => setSelectedStatus(item.status)}
                  style={[
                    styles.statusBox,
                    {
                      backgroundColor: statusStyle.backgroundColor,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: isSelected ? COLORS.primary : 'transparent',
                    },
                  ]}
                >
                  <MainText style={styles.statusText}>{item.status}</MainText>
                </Pressable>
              );
            }}
            contentContainerStyle={{
              paddingHorizontal: SIZES.width * 0.05,
              marginBottom: fontSize(5),
            }}
            ItemSeparatorComponent={() => (
              <View style={{ width: SIZES.width * 0.022 }} />
            )}
          />
        </View>
      )}
      <View style={styles.mainStyle}>
        {activeToggle === 'loans' && (
          <FlatList
            data={filteredLoans}
            keyExtractor={item => item?._id?.toString()}
            renderItem={({ item }) => (
              <DetailsCard item={item} onPress={() => handleCardPress(item)} />
            )}
            // ItemSeparatorComponent={<Seperator />}
            ListEmptyComponent={<Nodata top={SIZES.height * 0.2} custom />}
            contentContainerStyle={{ paddingBottom: SIZES.height * 0.5 }}
            showsVerticalScrollIndicator={false}
          />
        )}
        {activeToggle === 'documents' && (
          <View style={styles.View}>
            <PressableView
              title="Complete Aadhar KYC"
              onPress={() => navigation.navigate('Aadhar', { customerId: id })}
            />
            <PressableView
              title="Complete Pan KYC"
              onPress={() => navigation.navigate('Pan', { customerId: id })}
            />
            <PressableView
              title="Add Bank Passbook Photo"
              onPress={() =>
                navigation.navigate('Passbook', { customerId: id })
              }
            />
            <PressableView
              title="Add Customer Address"
              onPress={() =>
                navigation.navigate('CustomerAddress', { customerId: id })
              }
            />
          </View>
        )}
      </View>

      <AddButton
        title="New"
        onPress={handleAddPress}
        mainStyle={{ position: 'absolute', bottom: 10, height: fontSize(50) }}
      />
    </MainView>
  );
};

export default ViewCustomer;

const styles = StyleSheet.create({
  mainStyle: {
    marginHorizontal: SIZES.width * 0.04,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: SIZES.width * 0.9,
    alignSelf: 'center',
    marginVertical: SIZES.height * 0.025,
    // backgroundColor: 'red'
  },
  textView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZES.width * 0.45,
  },
  toggleText: {
    fontSize: fontSize(16),
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginBottom: SIZES.height * 0.005,
  },
  activeIndicator: {
    height: SIZES.height * 0.0025,
    width: '100%',
    alignSelf: 'center',
    marginTop: SIZES.height * 0.01,
    borderRadius: 10,
  },
  statusBox: {
    paddingHorizontal: SIZES.width * 0.05,
    paddingVertical: SIZES.height * 0.0065,
    borderRadius: 4,
  },
  statusText: {
    fontSize: fontSize(12),
    fontFamily: FONTS.bold,
    color: COLORS.black,
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.lightBlack,
    paddingHorizontal: SIZES.width * 0.04,
    paddingVertical: SIZES.height * 0.0125,
    marginVertical: SIZES.height * 0.006,
  },
  plusView: {
    height: SIZES.width * 0.075,
    width: SIZES.width * 0.075,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    height: SIZES.width * 0.045,
    width: SIZES.width * 0.045,
    resizeMode: 'contain',
  },
  buttonText: {
    fontSize: fontSize(14),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});
