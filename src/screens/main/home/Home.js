import { useCallback, useEffect } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import StatsCard from '../../../components/card';
import LoanCard from '../../../components/loanCard';
import MainView from '../../../components/MainView';
import { COLORS, icons, SIZES } from '../../../constants';
import {
  saveFCMThunk,
  userProfile,
} from '../../../redux/slices/auth/authSlice';
import { getHomeThunk } from '../../../redux/slices/main/homeSlice';
import { getFcmToken } from '../../../services/firebase/notification';
import { ASYNC_DATA } from '../../../constants/constants';
import { getItem, setItem } from '../../../services/storage/asyncStorage';

const Home = ({ navigation }) => {
  const dispatch = useDispatch();
  const { homeData, loading } = useSelector(state => state.home);
  const { user, token } = useSelector(state => state.auth);
  console.log('homeData', homeData);

  const handlePermission = async () => {
    const fcmToken = await getFcmToken();
    if (!fcmToken) return;
    const tokenStatus = await getItem(ASYNC_DATA.FCM_TOKEN);
    if (tokenStatus === fcmToken) return;
    const response = await dispatch(
      saveFCMThunk({ pushNotificationToken: fcmToken }),
    );
    if (saveFCMThunk.fulfilled.match(response)) {
      setItem(ASYNC_DATA.FCM_TOKEN, fcmToken);
    }
  };

  useEffect(() => {
    dispatch(userProfile(user?.userId || user?._id));
    dispatch(getHomeThunk());
    handlePermission();
  }, []);

  const onRefresh = useCallback(() => {
    dispatch(userProfile(user?.userId || user?._id));
    dispatch(getHomeThunk());
  }, []);

  return (
    <MainView transparent={false}>
      <View style={styles.header}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={false} />
        }
      >
        <View style={styles.flexView}>
          <StatsCard
            onPress={() =>
              navigation.navigate('DeviceList', { title: 'Enrolled Devices' })
            }
            icon={icons.enrolled}
            count={homeData?.totalEnrolledDevices}
            text={'Enrolled Devices'}
            gradientColors={[COLORS.b1, COLORS.b2]}
            bgColor={COLORS.blue}
          />
          <StatsCard
            onPress={() =>
              navigation.navigate('DeviceList', {
                title: 'Not Active Devices',
                key: 'notActiveDevices',
              })
            }
            icon={icons.noActive}
            count={homeData?.totalNotActiveDevices}
            text={'Not Active Devices'}
            gradientColors={[COLORS.y1, COLORS.y2]}
            bgColor={COLORS.yellow}
          />
        </View>

        <View style={styles.flexView}>
          <StatsCard
            icon={icons.deactive}
            count={homeData?.totalDeactivatedDevices}
            text={'Deactivated Devices'}
            gradientColors={[COLORS.r1, COLORS.r2]}
            bgColor={COLORS.red}
            onPress={() =>
              navigation.navigate('DeviceList', {
                title: 'Deactivated Devices',
                key: 'deactivateDevices',
              })
            }
          />
          <StatsCard
            icon={icons.locked}
            count={homeData?.totalLockedDevices}
            text={'Locked Devices'}
            gradientColors={[COLORS.p1, COLORS.p2]}
            bgColor={COLORS.purple}
            onPress={() =>
              navigation.navigate('DeviceList', {
                title: 'Locked Devices',
                key: 'lockedDevices',
              })
            }
          />
        </View>

        <View style={styles.container}>
          <LoanCard
            text={'All Loans'}
            icon={icons.allLoans}
            gradientColors={[COLORS.lg01, COLORS.lg11]}
            onPress={() =>
              navigation.navigate('DeviceList', {
                title: 'All Loans',
                filter: true,
              })
            }
          />
          <LoanCard
            text={'Loans (Running Device)'}
            icon={icons.loans}
            gradientColors={[COLORS.lg02, COLORS.lg12]}
            onPress={() =>
              navigation.navigate('DeviceList', {
                title: 'Loans (Running Device)',
                key: 'runningDevice',
              })
            }
          />
          <LoanCard
            text={'Loans (New Device)'}
            icon={icons.newLoans}
            gradientColors={[COLORS.lg03, COLORS.lg13]}
            onPress={() =>
              navigation.navigate('DeviceList', {
                title: 'Loans (New Device)',
                key: 'newDevice',
              })
            }
          />
          <LoanCard
            text={'All Customers'}
            icon={icons.allCustomers}
            gradientColors={[COLORS.lg04, COLORS.lg14]}
            onPress={() =>
              navigation.navigate('CutomerList', { title: 'Customers' })
            }
          />
          <LoanCard
            text={'Due Installments'}
            icon={icons.due}
            gradientColors={[COLORS.lg05, COLORS.lg15]}
            onPress={() =>
              navigation.navigate('DeviceList', {
                title: 'Due Installments',
                key: 'dueInstallments',
              })
            }
          />
          <LoanCard
            text={'Bulk Lock/Unlock'}
            icon={icons.unlocked}
            gradientColors={[COLORS.lg06, COLORS.lg16]}
            onPress={() => navigation.navigate('LockDevices')}
          />
        </View>
      </ScrollView>
    </MainView>
  );
};

export default Home;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.width * 0.05,
  },
  logo: {
    width: SIZES.width * 0.2,
    height: SIZES.height * 0.07,
    resizeMode: 'contain',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: SIZES.height * 0.01,
    paddingBottom: SIZES.height * 0.15,
  },
  flexView: {
    flexDirection: 'row',
    height: SIZES.height * 0.16,
    marginHorizontal: SIZES.width * 0.045,
    gap: SIZES.width * 0.018,
  },
  container: {
    marginHorizontal: SIZES.width * 0.045,
    gap: SIZES.width * 0.026,
  },
});
