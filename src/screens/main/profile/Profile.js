import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ProfileCard from '../../../components/card/ProfileCard';
import CustomHeader from '../../../components/header/CustomHeader';
import MainText from '../../../components/MainText';
import MainView from '../../../components/MainView';
import LogoutModal from '../../../components/Modal/LogoutModal';
import { COLORS, FONTS, icons, images, SIZES } from '../../../constants';
import { logoutAction } from '../../../redux/slices/auth/authSlice';
import { fontSize } from '../../../utils/fontSize';

import { MEDIA_BASE_URL } from '../../../services/axios/api';

const Profile = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    handleModalToggle();
    dispatch(logoutAction());
  };

  const [modal, setModal] = useState(false);
  const handleModalToggle = () => {
    setModal(!modal);
  };

  const profileUri =
    user?.profileUrl && typeof user.profileUrl === 'string'
      ? user.profileUrl.startsWith('http')
        ? user.profileUrl
        : `${MEDIA_BASE_URL}/${user.profileUrl}`
      : null;

  return (
    <MainView transparent={false} bottomSafe={true}>
      <CustomHeader title="Profile" />

      <View style={styles.mainStyle}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: SIZES.height * 0.15 }}
        >
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Image
              style={styles.profile}
              source={profileUri ? { uri: profileUri } : images.defaultUser}
            />

            <View style={styles.nameSection}>
              <MainText style={styles.boldText}>{user?.name}</MainText>

              <View style={styles.flex}>
                <MainText style={styles.normalText}>{user?.phone}</MainText>
              </View>

              <View style={styles.flex}>
                <Image style={styles.allIcon} source={icons.email} />
                <MainText style={styles.normalText}>{user?.email}</MainText>
              </View>
            </View>
          </View>
          <MainText
            style={[styles.boldText, { marginVertical: SIZES.height * 0.006 }]}
          >
            Manage Account
          </MainText>
          <ProfileCard
            icon={icons.editProfile}
            title="Edit Profile"
            subtitle="Edit your Profile."
            onPress={() => navigation.navigate('EditProfile')}
          />

          <ProfileCard
            icon={icons.appLock}
            title="App Lock"
            subtitle="Keep your app access safe."
            onPress={() => navigation.navigate('AppLock')}
          />
          <ProfileCard
            icon={icons.bankDetails}
            title="Bank Details"
            subtitle="Edit your bank info."
            onPress={() => navigation.navigate('BankList')}
          />
          <ProfileCard
            icon={icons.iphone}
            title="Customer App QR"
            subtitle="Install Customer App."
            onPress={() => navigation.navigate('CustomerQr')}
          />
          <ProfileCard
            icon={icons.appLock} // Using appLock icon as placeholder
            title="Extra Features"
            subtitle="Manage advanced settings."
            onPress={() => navigation.navigate('ExtraFeatures')}
          />
          <ProfileCard
            icon={icons.installationVdo}
            title="Installation Videos"
            subtitle="Watch setup and usage Videos"
            onPress={() => navigation.navigate('InstallationVideo')}
          />
          <ProfileCard
            icon={icons.support}
            title="Support"
            subtitle="Get help & support."
            onPress={() => navigation.navigate('Support')}
          />
          <ProfileCard
            icon={icons.feedback}
            title="Feedback"
            subtitle="Share your feedback."
            onPress={() => navigation.navigate('Feedback')}
          />
          <ProfileCard
            icon={icons.key}
            title="Request Keys"
            subtitle="Ask for new keys."
            onPress={() => navigation.navigate('RequestKeys')}
          />
          <ProfileCard
            icon={icons.keyHistory}
            title="Keys History"
            subtitle="View key activity."
            onPress={() => navigation.navigate('KeysHistory')}
          />
          <ProfileCard
            icon={icons.logout}
            title="Logout"
            subtitle="Sign out from your account."
            titleStyle={{ color: COLORS.red }}
            onPress={handleModalToggle}
          />
        </ScrollView>

        <LogoutModal
          visible={modal}
          onRequestClose={handleModalToggle}
          handleLogout={handleLogout}
        />
      </View>
    </MainView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  mainStyle: {
    marginHorizontal: SIZES.width * 0.035,
  },
  profileSection: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginVertical: SIZES.height * 0.015,
    paddingVertical: SIZES.h6,
    paddingHorizontal: SIZES.body4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.width * 0.025,
  },
  profile: {
    height: SIZES.width * 0.2,
    width: SIZES.width * 0.2,
    borderRadius: 50,
    backgroundColor: COLORS.border,
    resizeMode: 'cover',
  },
  allIcon: {
    height: SIZES.width * 0.045,
    width: SIZES.width * 0.045,
    resizeMode: 'contain',
    marginRight: SIZES.width * 0.008,
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.width * 0.02,
  },
  nameSection: {
    gap: SIZES.width * 0.01,
  },
  boldText: {
    fontSize: fontSize(18),
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  normalText: {
    fontSize: fontSize(15),
    fontFamily: FONTS.regular,
    color: COLORS.white,
  },
});
