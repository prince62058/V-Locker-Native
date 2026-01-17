import {
  BackHandler,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MainView from '../../../components/MainView';
import CustomHeader from '../../../components/header/CustomHeader';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../../components/common/loader/Loader';
import Seperator from '../../../components/common/seperator/Seperator';
import Nodata from '../../../components/common/nodata/Nodata';
import { SIZES } from '../../../constants';
import LockDeviceCard from '../../../components/card/LockDeviceCard';
import SearchBox from '../../../components/search';
import DeviceLockModal from '../../../components/Modal/DeviceLockModal';
import AppLockSheet from '../../../components/gorhumsheet/AppLockSheet';
import { showToast } from '../../../utils/ToastAndroid';
import {
  getLoanListThunk,
  updateLoanThunk,
} from '../../../redux/slices/main/loanSlice';

const LockDevices = () => {
  const dispatch = useDispatch();
  const { loanData, loading } = useSelector(state => state.loan);

  const [selectedItem, setSelectedItem] = useState({});
  const [modal, setModal] = useState(false);

  const handleModalToggle = item => {
    setSelectedItem(item);
    setModal(!modal);
  };

  const [search, setSearch] = useState('');
  const handleSearch = value => {
    setSearch(value);
  };

  const fetchData = useCallback(
    ({ isRefresh = false }) => {
      dispatch(
        getLoanListThunk({ isRefresh, page: 1, limit: 100, search: search }),
      );
    },
    [dispatch, search],
  );

  useEffect(() => {
    fetchData({});
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    fetchData({ isRefresh: true });
  }, [fetchData]);

  const handleLockPress = async () => {
    if (!selectedItem?._id) return;

    console.log('Device lock api call ', selectedItem?._id);

    // Toggle the current status
    const isLocked = selectedItem?.deviceUnlockStatus === 'LOCKED';
    const newStatus = isLocked ? 'UNLOCKED' : 'LOCKED';

    try {
      await dispatch(
        updateLoanThunk({
          id: selectedItem._id,
          data: {
            deviceUnlockStatus: newStatus,
          },
        }),
      ).unwrap();

      showToast(
        newStatus === 'LOCKED'
          ? 'Device Locked Successfully'
          : 'Device Unlocked Successfully',
      );
    } catch (error) {
      console.error('Lock error', error);
    } finally {
      setSelectedItem({});
      setModal(false);
    }
  };

  const [selectedFilter, setSelectedFilter] = useState('DEVICE');
  const [selectedFilterValue, setSelectedFilterValue] = useState([]);
  const handleSelectFilter = value => {
    setSelectedFilterValue(prev => {
      if (prev.includes(value)) {
        return prev;
      }
      return [...prev, value];
    });
  };

  const handleRemoveFilter = value => {
    if (value) {
      setSelectedFilterValue(prev => prev.filter(item => item !== value));
    } else {
      setSelectedFilterValue([]);
    }
  };

  const handleFilter = () => {
    if (selectedFilterValue?.length < 1) {
      showToast('Select atleast one filter value');
    }
    console.log('first', selectedFilterValue);
  };

  const filterSheetRef = useRef(null);
  const handlePresent = useCallback(ref => {
    ref.current?.present();
  }, []);
  const handleDismiss = useCallback(ref => {
    ref.current?.dismiss();
  }, []);
  const [sheetOpen, setSheetOpen] = useState({
    filter: false,
  });
  const handleSheetChange = (key, value) => {
    setSheetOpen(prev => ({ ...prev, [key]: value }));
  };
  useEffect(() => {
    const backAction = () => {
      if (sheetOpen.filter) {
        handleDismiss(filterSheetRef);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [sheetOpen]);

  const renderItem = ({ item, index }) => {
    // Map API data to Card props
    const cardItem = {
      ...item,
      ...item,
      deviceName:
        `${item?.mobileBrand || ''} ${item?.mobileModel || ''}`.trim() ||
        'Unknown Device',
      dataStatus:
        item?.loanStatus === 'APPROVED'
          ? 'Active'
          : item?.loanStatus || 'Offline',
      name: item?.customerId?.customerName || 'Unknown',
      phone: item?.customerId?.customerMobileNumber || '',
      loanId: index + 1,
      dueDate: item?.nextEmiDetails?.dueDate
        ? moment(item.nextEmiDetails.dueDate).format('DD MMM YYYY')
        : 'N/A',
      amountDue: item?.nextEmiDetails?.amount
        ? `₹${item.nextEmiDetails.amount}`
        : 'N/A',
      // frequency: item?.frequency || "Monthly",
      lockedStatus: item?.deviceUnlockStatus === 'LOCKED',
    };

    return <LockDeviceCard item={cardItem} onPress={handleModalToggle} />;
  };

  return (
    <MainView transparent={false}>
      <CustomHeader title="Lock Devices" back />
      <SearchBox
        value={search}
        handleChange={handleSearch}
        showFilter={true}
        handleFilter={() => handlePresent(filterSheetRef)}
      />

      {loading?.loading ? (
        <Loader />
      ) : (
        <FlatList
          data={loanData || []}
          keyExtractor={(item, index) => item?._id || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={
            loanData?.length > 0
              ? styles.contentContainerStyle
              : styles.emptyContainerStyle
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading?.refreshing}
              onRefresh={onRefresh}
            />
          }
          ItemSeparatorComponent={<Seperator height={SIZES.height * 0.02} />}
          ListEmptyComponent={<Nodata />}
        />
      )}

      <DeviceLockModal
        visible={modal}
        handleModalToggle={() => setModal(!modal)}
        handleConfirm={handleLockPress}
        item={selectedItem}
      />

      <AppLockSheet
        ref={filterSheetRef}
        handleSheetChanges={index => handleSheetChange('filter', index >= 0)}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        selectedFilterValue={selectedFilterValue}
        handleSelectFilter={handleSelectFilter}
        handleRemoveFilter={handleRemoveFilter}
        handleFilter={handleFilter}
      />
    </MainView>
  );
};

export default LockDevices;

const styles = StyleSheet.create({
  contentContainerStyle: {
    paddingHorizontal: SIZES.width * 0.05,
  },
  emptyContainerStyle: {
    flex: 1,
  },
});
