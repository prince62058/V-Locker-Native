import { useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import MainView from '../../../components/MainView';
import KeysCard from '../../../components/card/KeysCard';
import Loader from '../../../components/common/loader/Loader';
import Nodata from '../../../components/common/nodata/Nodata';
import Seperator from '../../../components/common/seperator/Seperator';
import CustomHeader from '../../../components/header/CustomHeader';
import { SIZES } from '../../../constants';
import { getKeyListThunk } from '../../../redux/slices/main/keySlice';

const KeysHistory = ({ navigation }) => {
  const dispatch = useDispatch();
  const { keyData, loading, pagination } = useSelector(state => state.keys);

  const fetchData = useCallback(
    ({ isRefresh = false, page = 1, search = '' }) => {
      dispatch(getKeyListThunk({ isRefresh, page, search }));
    },
    [dispatch],
  );

  useEffect(() => {
    fetchData({});
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    fetchData({ isRefresh: true });
  }, [fetchData]);

  const handlePagination = () => {
    if (loading?.pagination || loading?.loading) return;
    if (pagination?.currentPage < pagination?.totalPages) {
      fetchData({ page: Number(pagination?.currentPage) + 1 });
    }
  };

  return (
    <MainView transparent={false}>
      <CustomHeader title="Keys History" back />

      {(loading?.loading && keyData?.length <= 0) || loading.search ? (
        <Loader />
      ) : (
        <FlatList
          data={keyData}
          keyExtractor={item => item?._id}
          renderItem={({ item }) => <KeysCard item={item} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading?.refreshing}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={
            keyData?.length > 0
              ? styles.contentContainerStyle
              : styles.emptyContainerStyle
          }
          ListEmptyComponent={<Nodata />}
          ItemSeparatorComponent={<Seperator height={SIZES.height * 0.01} />}
          onEndReached={handlePagination}
          onEndReachedThreshold={0.1}
        />
      )}
    </MainView>
  );
};

export default KeysHistory;

const styles = StyleSheet.create({
  contentContainerStyle: {
    paddingHorizontal: SIZES.width * 0.05,
    paddingTop: SIZES.height * 0.01,
    paddingBottom: SIZES.height * 0.1,
  },
  emptyContainerStyle: {
    flex: 1,
  },
});
