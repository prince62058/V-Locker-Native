import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import CustomHeader from '../../../components/header/CustomHeader';
import LoanScreenCard from '../../../components/loanScreenCard';
import MainView from '../../../components/MainView';
import SearchBox from '../../../components/search';
import { SIZES } from '../../../constants';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearSearch,
  getLoanListThunk,
} from '../../../redux/slices/main/loanSlice';
import Loader from '../../../components/common/loader/Loader';
import Nodata from '../../../components/common/nodata/Nodata';
import Seperator from '../../../components/common/seperator/Seperator';
import LoanSheet from '../../../components/gorhumsheet/LoanSheet';
import { showToast } from '../../../utils/ToastAndroid';
let debounceTimer;

const DeviceList = ({ navigation, route }) => {
  const { key } = route?.params ?? {};

  const dispatch = useDispatch();
  const { loanData, loading, pagination, searchData, searchPagination } =
    useSelector(state => state.loan);
  // console.log('Loan devices ---> ', loading)

  const [search, setSearch] = useState('');

  const fetchData = useCallback(
    ({ isRefresh = false, page = 1, search = '', filter = key }) => {
      dispatch(getLoanListThunk({ isRefresh, page, search, filter }));
    },
    [dispatch],
  );

  useEffect(() => {
    fetchData({});
  }, [fetchData]);

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (!search) {
        dispatch(clearSearch());
        return;
      }
      console.log('seacrh data --> ', search);
      // fetchData({ search, page: 1 }) // Always reset to page 1 on new search
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [search, fetchData]);

  const onRefresh = useCallback(() => {
    fetchData({ isRefresh: true });
    setSearch('');
    dispatch(clearSearch());
  }, [fetchData]);

  const handlePagination = () => {
    console.log('handleP pagination triggered');
    if (
      loading?.pagination ||
      loading?.loading ||
      searchPagination?.loading ||
      searchPagination?.pagination
    )
      return;
    if (pagination?.currentPage < pagination?.totalPages) {
      console.log('Pagination run with ', search);
      fetchData({ page: Number(pagination?.currentPage) + 1, search });
    }
  };

  const handleCardPress = item => {
    navigation.navigate('LoanInfo', { loanId: item?._id });
  };

  const handleNavigation = () => {
    navigation.popToTop();
    navigation.navigate('Tab', { screen: 'AddCustomer' });
  };

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
      return;
    }
    console.log('Loan filter -->', selectedFilterValue);
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

  return (
    <MainView transparent={false}>
      <CustomHeader title={route.params?.title} back />

      {loanData?.length > 0 && (
        <SearchBox
          value={search}
          handleChange={setSearch}
          showFilter={route.params?.filter ?? false}
          handleFilter={() => handlePresent(filterSheetRef)}
        />
      )}

      {loading?.loading || loading?.search ? (
        <Loader />
      ) : (
        <FlatList
          data={search ? searchData : loanData}
          keyExtractor={(item, index) =>
            item?._id ? `${item._id}-${index}` : index.toString()
          }
          renderItem={({ item }) => (
            <LoanScreenCard item={item} onPress={() => handleCardPress(item)} />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading?.refreshing}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={
            loanData?.length > 0
              ? styles.contentContainerStyle
              : styles.emptyContainerStyle
          }
          ListEmptyComponent={<Nodata custom onPress={handleNavigation} />}
          ItemSeparatorComponent={<Seperator height={SIZES.height * 0.01} />}
          onEndReached={handlePagination}
          onEndReachedThreshold={0.1} // 10% of the visible length of the list from the bottom.
        />
      )}

      <LoanSheet
        ref={filterSheetRef}
        handleSheetChanges={index => handleSheetChange('filter', index >= 0)}
        selectedFilterValue={selectedFilterValue}
        handleSelectFilter={handleSelectFilter}
        handleRemoveFilter={handleRemoveFilter}
        handleFilter={handleFilter}
      />
    </MainView>
  );
};

export default DeviceList;

const styles = StyleSheet.create({
  mainStyle: {
    marginHorizontal: SIZES.width * 0.035,
  },
  contentContainerStyle: {
    paddingHorizontal: SIZES.width * 0.05,
  },
  emptyContainerStyle: {
    flex: 1,
  },
});
