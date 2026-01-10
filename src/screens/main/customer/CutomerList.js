import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import Loader from '../../../components/common/loader/Loader';
import ConfirmModal from '../../../components/common/modal/ConfirmModal';
import Nodata from '../../../components/common/nodata/Nodata';
import Seperator from '../../../components/common/seperator/Seperator';
import CustomerCard from '../../../components/customerCard';
import CustomHeader from '../../../components/header/CustomHeader';
import MainView from '../../../components/MainView';
import SearchBox from '../../../components/search';
import { SIZES } from '../../../constants';
import {
  clearSearch,
  deleteCustomerThunk,
  getCustomerThunk,
} from '../../../redux/slices/main/customerSlice';
import DeleteUserModal from '../../../components/Modal/DeleteUserModal';

let debounceTimer;

const CutomerList = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const {
    customerData = [],
    loading,
    pagination,
    searchData,
    searchPagination,
  } = useSelector(state => state.customer);
  // console.log('customer data', loading)

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modal, setModal] = useState({ delete: false });
  const [search, setSearch] = useState('');

  const handleModal = (key, value) => {
    setModal(prev => ({ ...prev, [key]: value }));
  };

  const fetchData = useCallback(
    ({ isRefresh = false, page = 1, search = '' }) => {
      dispatch(getCustomerThunk({ isRefresh, page, search }));
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
      fetchData({ search, page: 1 }); // Always reset to page 1 on new search
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [search, fetchData]);

  const onRefresh = useCallback(() => {
    fetchData({ isRefresh: true });
    setSearch('');
    dispatch(clearSearch());
  }, [fetchData]);

  const handlePagination = () => {
    const isLoading =
      loading?.pagination ||
      loading?.loading ||
      searchPagination?.loading ||
      searchPagination?.pagination;

    if (isLoading) return;

    const { currentPage = 1, totalPages = 1 } = pagination || {};

    const hasMorePages = currentPage < totalPages;
    if (!hasMorePages) return;

    const nextPage = currentPage + 1;

    fetchData({ page: nextPage, search });
  };

  const handleCustomerDelete = async () => {
    handleModal('delete', false);
    if (selectedCustomer?._id) {
      await dispatch(deleteCustomerThunk({ id: selectedCustomer._id }));
      setSelectedCustomer(null);
    }
  };

  const handleDeletePress = item => {
    setSelectedCustomer(item);
  };

  const handleModalToggle = (item = null) => {
    setSelectedCustomer(item);
    handleModal('delete', !modal?.delete);
  };

  return (
    <MainView transparent={false}>
      <CustomHeader title={route.params?.title} back />

      <SearchBox
        value={search}
        handleChange={setSearch} // ✅ search updates state
      />

      {loading?.loading || loading?.search ? (
        <Loader />
      ) : (
        <FlatList
          data={search ? searchData : customerData}
          keyExtractor={item => item?._id}
          renderItem={({ item }) => (
            <CustomerCard
              id={item?._id}
              name={item?.customerName}
              phone={item?.customerMobileNumber}
              location={item?.address}
              activeLoans={item?.activeLoans}
              status={item?.isVerified}
              onEdit={() =>
                navigation.navigate('ViewCustomer', { id: item?._id })
              }
              onDelete={() => handleModalToggle(item)}
              profile={item?.profileUrl}
            />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading?.refreshing}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={
            customerData?.length > 0
              ? styles.contentContainerStyle
              : styles.emptyContainerStyle
          }
          ListEmptyComponent={<Nodata />}
          ItemSeparatorComponent={<Seperator height={SIZES.height * 0.01} />}
          onEndReached={handlePagination}
          onEndReachedThreshold={0.1}
        />
      )}

      <DeleteUserModal
        visible={modal.delete}
        handleModalToggle={handleModalToggle}
        handleConfirm={handleCustomerDelete}
        item={selectedCustomer}
      />
    </MainView>
  );
};

export default CutomerList;

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
