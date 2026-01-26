import {
  BackHandler,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  DeviceEventEmitter,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MainView from '../../../components/MainView';
import CustomHeader from '../../../components/header/CustomHeader';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../../components/common/loader/Loader';
import Seperator from '../../../components/common/seperator/Seperator';
import Nodata from '../../../components/common/nodata/Nodata';
import { COLORS, FONTS, icons, SIZES } from '../../../constants';
import LockDeviceCard from '../../../components/card/LockDeviceCard';
import SearchBox from '../../../components/search';
import DeviceLockModal from '../../../components/Modal/DeviceLockModal';
import AppLockSheet from '../../../components/gorhumsheet/AppLockSheet';
import { showToast } from '../../../utils/ToastAndroid';
import {
  getLoanListThunk,
  updateLoanThunk,
  lockDeviceThunk,
  unlockDeviceThunk,
  updateDevicePolicyThunk,
  lockDeviceBulkThunk,
  unlockDeviceBulkThunk,
  updateDevicePolicyBulkThunk,
} from '../../../redux/slices/main/loanSlice';
import { fontSize } from '../../../utils/fontSize';
import MainText from '../../../components/MainText';

const LockDevices = () => {
  const dispatch = useDispatch();
  const { loanData, loading } = useSelector(state => state.loan);

  const [selectedItem, setSelectedItem] = useState({});
  const [modal, setModal] = useState(false);
  const [selectedLoanIds, setSelectedLoanIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelection = id => {
    setSelectedLoanIds(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(i => i !== id);
        if (next.length === 0) setIsSelectionMode(false);
        return next;
      }
      return [...prev, id];
    });
  };

  const handleToggleAction = item => {
    if (isSelectionMode) {
      toggleSelection(item._id);
    } else {
      setSelectedItem(item);
      setModal(true);
    }
  };

  const handleLongPress = item => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedLoanIds([item._id]);
    }
  };

  const selectAll = () => {
    const data = loanData || [];
    if (selectedLoanIds.length === data.length) {
      setSelectedLoanIds([]);
      setIsSelectionMode(false);
    } else {
      setSelectedLoanIds(data.map(l => l._id));
    }
  };

  const [search, setSearch] = useState('');
  const handleSearch = value => {
    setSearch(value);
  };

  const fetchData = useCallback(
    ({ isRefresh = false, filters = {} }) => {
      const apiParams = {
        isRefresh,
        page: 1,
        limit: 100,
        search: search,
        ...filters,
      };

      // If explicit filters are missing from args, re-apply current selected filters
      if (Object.keys(filters).length === 0 && selectedFilterValue.length > 0) {
        if (selectedFilterValue.includes('LOCKED'))
          apiParams.lockedDevices = true;
        if (selectedFilterValue.includes('UNLOCKED'))
          apiParams.unlockDevices = true;
        if (selectedFilterValue.includes('ONLINE'))
          apiParams.runningDevice = true;
        if (selectedFilterValue.includes('OFFLINE'))
          apiParams.notActiveDevices = true;
      }

      dispatch(getLoanListThunk(apiParams));
    },
    [dispatch, search, selectedFilterValue],
  );

  useEffect(() => {
    fetchData({});
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    fetchData({ isRefresh: true });
  }, [fetchData]);

  const handleLockPress = async () => {
    const isBulk = selectedLoanIds.length > 1;
    const targetIds = isBulk ? selectedLoanIds : [selectedItem?._id];

    // For bulk, we need a consensus or just target one status.
    // Usually bulk lock means lock ALL. Bulk unlock means unlock ALL.
    // In this UI, we'll let the modal decide based on the first item, but apply to all.
    const isLocked =
      (isBulk ? loanData.find(l => l._id === selectedLoanIds[0]) : selectedItem)
        ?.deviceUnlockStatus === 'LOCKED';
    const newStatus = isLocked ? 'UNLOCKED' : 'LOCKED';

    try {
      if (isBulk) {
        await dispatch(
          newStatus === 'LOCKED'
            ? lockDeviceBulkThunk({ loanIds: selectedLoanIds })
            : unlockDeviceBulkThunk({ loanIds: selectedLoanIds }),
        ).unwrap();
        showToast(`Bulk ${newStatus.toLowerCase()} successful`);
      } else {
        await dispatch(
          newStatus === 'LOCKED'
            ? lockDeviceThunk({ identifier: selectedItem.imeiNumber1 })
            : unlockDeviceThunk({ identifier: selectedItem.imeiNumber1 }),
        ).unwrap();
        showToast('Status updated successfully');
      }
    } catch (error) {
      showToast('Error updating status');
    } finally {
      setSelectedItem({});
      setSelectedLoanIds([]);
      setIsSelectionMode(false);
      setModal(false);
    }
  };

  const handlePolicyUpdate = async (type, value) => {
    const isBulk = selectedLoanIds.length > 1;
    const targetItem = isBulk
      ? loanData.find(l => l._id === selectedLoanIds[0])
      : selectedItem;
    if (!targetItem) return;

    const currentPolicy = targetItem?.devicePolicy || {};
    const mergedPolicy = { ...currentPolicy };

    // Update specific field
    if (type === 'DEV_MODE') mergedPolicy.isDeveloperOptionsBlocked = value;
    if (type === 'RESET') mergedPolicy.isResetAllowed = value;
    if (type === 'UNINSTALL') mergedPolicy.isUninstallAllowed = value;
    if (type === 'WALLPAPER') mergedPolicy.isWallpaperEnabled = value;
    if (type === 'WALLPAPER_URL') mergedPolicy.wallpaperUrl = value;
    if (type === 'WHATSAPP') mergedPolicy.isWhatsAppBlocked = value;
    if (type === 'INSTAGRAM') mergedPolicy.isInstagramBlocked = value;
    if (type === 'SNAPCHAT') mergedPolicy.isSnapchatBlocked = value;
    if (type === 'YOUTUBE') mergedPolicy.isYouTubeBlocked = value;
    if (type === 'FACEBOOK') mergedPolicy.isFacebookBlocked = value;
    if (type === 'DIALER') mergedPolicy.isDialerBlocked = value;
    if (type === 'MESSAGES') mergedPolicy.isMessagesBlocked = value;
    if (type === 'PLAYSTORE') mergedPolicy.isPlayStoreBlocked = value;
    if (type === 'CHROME') mergedPolicy.isChromeBlocked = value;

    try {
      if (isBulk) {
        await dispatch(
          updateDevicePolicyBulkThunk({
            loanIds: selectedLoanIds,
            policy: mergedPolicy,
          }),
        ).unwrap();
        showToast('Bulk policy updated');
      } else {
        await dispatch(
          updateDevicePolicyThunk({
            loanId: selectedItem._id,
            policy: mergedPolicy,
          }),
        ).unwrap();
        showToast('Policy updated');
      }
    } catch (error) {
      showToast('Error updating policy');
    } finally {
      if (isBulk) {
        setSelectedLoanIds([]);
        setIsSelectionMode(false);
      }
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
      // If cleared, just fetch default
      handleDismiss(filterSheetRef);
      fetchData({ isRefresh: true, filters: {} });
      return;
    }

    const filters = {};
    if (selectedFilterValue.includes('LOCKED')) filters.lockedDevices = true;
    if (selectedFilterValue.includes('UNLOCKED')) filters.unlockDevices = true;
    if (selectedFilterValue.includes('ONLINE')) filters.runningDevice = true;
    if (selectedFilterValue.includes('OFFLINE'))
      filters.notActiveDevices = true;

    console.log('applying filters', filters);
    handleDismiss(filterSheetRef);
    fetchData({ isRefresh: true, filters });
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
      if (isSelectionMode) {
        setIsSelectionMode(false);
        setSelectedLoanIds([]);
        return true;
      }
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
  }, [sheetOpen, isSelectionMode]);

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

    return (
      <LockDeviceCard
        item={cardItem}
        isSelected={selectedLoanIds.includes(item._id)}
        onPress={() => handleToggleAction(item)}
        onLongPress={() => handleLongPress(item)}
      />
    );
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
        handleModalToggle={() => setModal(false)}
        handleConfirm={handleLockPress}
        onUpdate={handlePolicyUpdate}
        item={selectedItem}
        selectedItems={(loanData || []).filter(l =>
          selectedLoanIds.includes(l._id),
        )}
      />

      {isSelectionMode && (
        <View style={styles.bulkFooter}>
          <TouchableOpacity style={styles.bulkBtn} onPress={selectAll}>
            <MainText style={styles.bulkBtnText}>
              {selectedLoanIds.length === (loanData || []).length
                ? 'Deselect'
                : 'Select All'}
            </MainText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => setModal(true)}
          >
            <MainText style={styles.bulkBtnText}>Bulk Action</MainText>
          </TouchableOpacity>
        </View>
      )}

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
  bulkFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.lightBlack,
    flexDirection: 'row',
    padding: SIZES.width * 0.05,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray + '20',
    paddingBottom: Platform?.OS === 'ios' ? 30 : 20,
  },
  bulkBtn: {
    flex: 1,
    backgroundColor: COLORS.gray + '40',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  bulkBtnText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});
