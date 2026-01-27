import React from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Text,
  Linking,
} from 'react-native';
import MainText from '../MainText';
import { COLORS, FONTS, SIZES, icons, images } from '../../constants';
import { fontSize } from '../../utils/fontSize';
import { getStatusStyle } from '../../utils/getStyle';

import { MEDIA_BASE_URL } from '../../services/axios/api';

const CustomerCard = ({
  id,
  name,
  phone,
  location,
  activeLoans,
  status,
  onEdit,
  onDelete,
  showCustomerId = true,
  showDeleteButton = true,
  showStatus = true,
  icon = false,
  profile,
}) => {
  // const statusStyle = getStatusStyle(status);

  const handleCall = () => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = () => {
    if (phone) Linking.openURL(`whatsapp://send?phone=${phone}`);
  };

  const getProfileUrl = () => {
    if (!profile) return null;
    if (typeof profile === 'object' && profile.uri) return profile.uri;
    if (typeof profile === 'string') {
      if (profile.startsWith('http')) return profile;
      const cleanPath = profile.startsWith('/')
        ? profile.substring(1)
        : profile;
      return `${MEDIA_BASE_URL}/${cleanPath}?t=${new Date().getTime()}`;
    }
    return null;
  };

  const profileUri = getProfileUrl();

  return (
    <Pressable style={styles.customView} onPress={onEdit}>
      {/* <View style={styles.statusContainer}>
                {showCustomerId && <Text numberOfLines={1} style={styles.idText}>Customer ID: {id}</Text>}

                {showStatus && (
                    <View style={[styles.statusBox, { backgroundColor: statusStyle.backgroundColor }]}>
                        <MainText style={styles.statusText}>{status}</MainText>
                    </View>
                )}
            </View> */}

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View>
          <Image
            style={styles.profile}
            source={profileUri ? { uri: profileUri } : images.userProfile}
          />
          <Pressable style={styles.editView} onPress={onEdit}>
            <Image style={styles.editIcon} source={icons.edit} />
          </Pressable>
        </View>

        <View style={styles.nameSection}>
          <MainText style={styles.boldText}>{name}</MainText>

          <Pressable style={styles.flex} onPress={handleCall}>
            <Image style={styles.allIcon} source={icons.telephone} />
            <MainText style={styles.phoneNo}>{phone}</MainText>
          </Pressable>

          <View style={[styles.flex, { alignItems: 'flex-start' }]}>
            <Image style={styles.allIcon} source={icons.location} />
            <MainText style={[styles.normalText, { flex: 1 }]}>
              {location
                ? String(location).trim() || 'No Address'
                : 'No Address'}
            </MainText>
          </View>

          <View style={styles.flex}>
            <Image style={styles.allIcon} source={icons.commission} />
            <Text style={styles.normalText}>Active Loans: {activeLoans}</Text>
          </View>
        </View>
        {icon && (
          <Pressable onPress={handleWhatsApp}>
            <Image source={images.whatsapp} style={styles.whatsappIcon} />
          </Pressable>
        )}
      </View>

      {showDeleteButton && (
        <Pressable style={styles.dltView} onPress={onDelete}>
          <Image style={styles.allIcon} source={icons.deleteIcon} />
          <MainText style={styles.dltText}>Delete Customer</MainText>
        </Pressable>
      )}
    </Pressable>
  );
};

export default CustomerCard;

const styles = StyleSheet.create({
  customView: {
    width: '99%',
    elevation: 4,
    borderRadius: SIZES.h4,
    backgroundColor: COLORS.lightBlack,
    paddingHorizontal: SIZES.width * 0.03,
    paddingVertical: SIZES.height * 0.03,
    marginVertical: SIZES.height * 0.005,
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.width * 0.02,
  },
  idText: {
    fontSize: fontSize(14),
    fontFamily: FONTS.regular,
    color: COLORS.white,
    maxWidth: '80%',
  },
  statusText: {
    fontSize: fontSize(14),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBox: {
    position: 'absolute',
    top: -5,
    right: -5,
    marginHorizontal: SIZES.width * 0.02,
    paddingHorizontal: SIZES.width * 0.05,
    paddingVertical: SIZES.height * 0.001,
    borderRadius: 4,
  },
  profileSection: {
    // marginVertical: SIZES.height * 0.015,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.width * 0.025,
  },
  profile: {
    height: SIZES.width * 0.26,
    width: SIZES.width * 0.26,
    borderRadius: 50,
    backgroundColor: COLORS.border,
  },
  editView: {
    position: 'absolute',
    bottom: SIZES.height * 0.005,
    right: 0,
    height: SIZES.width * 0.07,
    width: SIZES.width * 0.07,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    height: SIZES.width * 0.04,
    width: SIZES.width * 0.04,
    resizeMode: 'contain',
  },
  allIcon: {
    height: SIZES.width * 0.05,
    width: SIZES.width * 0.05,
    resizeMode: 'contain',
    marginRight: SIZES.width * 0.005,
  },
  nameSection: {
    marginTop: SIZES.height * 0.01,
    gap: SIZES.width * 0.01,
    flex: 1,
  },
  boldText: {
    fontSize: fontSize(20),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    // maxWidth: '80%'
  },
  phoneNo: {
    fontSize: fontSize(15),
    fontFamily: FONTS.regular,
    color: COLORS.primary,
    textDecorationLine: 'underline',
    letterSpacing: 0.4,
  },
  normalText: {
    fontSize: fontSize(15),
    fontFamily: FONTS.regular,
    color: COLORS.white,
  },
  dltView: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    // backgroundColor: COLORS.black,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 20,
    marginTop: 5,
  },
  dltText: {
    fontSize: fontSize(10),
    fontFamily: FONTS.bold,
    color: COLORS.red,
  },
  whatsappIcon: {
    height: SIZES.width * 0.08,
    width: SIZES.width * 0.08,
    resizeMode: 'contain',
  },
});
