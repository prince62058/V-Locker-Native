import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import MainText from '../../../components/MainText';
import MainView from '../../../components/MainView';
import Seperator from '../../../components/common/seperator/Seperator';
import CustomHeader from '../../../components/header/CustomHeader';
import { COLORS, FONTS, icons, SIZES } from '../../../constants';
import { showToast } from '../../../utils/ToastAndroid';
import { fontSize } from '../../../utils/fontSize';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { companyData } from '../../../redux/slices/auth/authSlice';

const Support = () => {
  const dispatch = useDispatch();
  const { company, loading, refreshing } = useSelector(state => state.auth);

  console.log('Company data ---> ', company);

  useEffect(() => {
    dispatch(companyData());
  }, []);

  const onRefresh = useCallback(() => {
    dispatch(companyData());
  }, []);
  const email = company?.supportEmail;
  const website = company?.website;
  const phone = company?.supportPhone;
  const openEmail = async to => {
    try {
      // Try Gmail app first
      const gmailUrl = `googlegmail://co?to=${to}`;
      const canOpenGmail = await Linking.canOpenURL(gmailUrl);
      if (canOpenGmail) {
        return Linking.openURL(gmailUrl);
      }
      // Fallback to default mail client
      const mailto = `mailto:${to}`;
      return Linking.openURL(mailto);
    } catch (err) {
      console.log('openEmail error ->', err);
      Alert.alert('Error', 'Could not open email client.');
    }
  };

  const openWebsite = async url => {
    try {
      if (!url) {
        showToast('Invalid URL', 'URL is missing.');
        return;
      }

      let link = url.trim();

      // Agar http/https nahi hai to add karo
      if (!/^https?:\/\//i.test(link)) {
        link = `https://${link}`;
      }

      const supported = await Linking.canOpenURL(link);

      if (supported) {
        await Linking.openURL(link); // ✅ yaha corrected link
      } else {
        showToast('Cannot open URL', 'No app can handle this link.');
      }
    } catch (err) {
      console.log('openWebsite error ->', err);
      showToast('Error', 'Could not open website.');
    }
  };

  const openWhatsAppOrCall = async phoneNumber => {
    if (!phoneNumber) {
      return Alert.alert('Error', 'Phone number is not available.');
    }
    // Normalize phone (remove spaces, parentheses, dashes)
    const normalized = phoneNumber.replace(/[\s()-]/g, '');
    const digitsOnly = normalized.replace(/^\+/, ''); // for wa.me fallback
    const whatsappUrl = `whatsapp://send?phone=${normalized}`;
    const whatsappWebUrl = `https://wa.me/${digitsOnly}`;

    // Show options (WhatsApp or Call)
    const onWhatsApp = async () => {
      try {
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          return Linking.openURL(whatsappUrl);
        }
        // fallback to wa.me in browser
        const canOpenWeb = await Linking.canOpenURL(whatsappWebUrl);
        if (canOpenWeb) {
          return Linking.openURL(whatsappWebUrl);
        }
        Alert.alert(
          'WhatsApp not available',
          'WhatsApp is not installed and cannot open web link.',
        );
      } catch (err) {
        console.log('openWhatsApp error ->', err);
        Alert.alert('Error', 'Could not open WhatsApp.');
      }
    };

    const onCall = async () => {
      try {
        const tel = `tel:${normalized}`;
        // [MODIFIED] Removed strict canOpenURL check which fails on some devices/simulators
        // Just try to open it and catch error if it fails
        await Linking.openURL(tel);
      } catch (err) {
        console.log('call error ->', err);
        Alert.alert(
          'Cannot call',
          'Phone call is not supported on this device or permission denied.',
        );
      }
    };

    // Platform-specific nice UI: ActionSheet on iOS, Alert with buttons elsewhere
    if (Platform.OS === 'ios') {
      Alert.alert('Contact', 'Choose an action', [
        { text: 'WhatsApp', onPress: onWhatsApp },
        { text: 'Call', onPress: onCall },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      // Android: Alert with buttons
      Alert.alert(
        'Contact',
        `${phoneNumber}`,
        [
          { text: 'WhatsApp', onPress: onWhatsApp },
          { text: 'Call', onPress: onCall },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true },
      );
    }
  };

  return (
    <MainView transparent={false}>
      <CustomHeader title={'Support'} back />

      <Seperator height={SIZES.height * 0.05} />

      <View style={styles.card}>
        <View style={styles.iconview}>
          <Image source={icons.clockoutline} style={styles.icons} />
        </View>
        <View>
          <MainText style={styles.title}>Timings</MainText>
          <MainText style={styles.value}>{company?.timings}</MainText>
        </View>
      </View>

      <Pressable
        onPress={() => openEmail(company?.supportEmail)}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.iconview}>
          <Image source={icons.emailoutline} style={styles.icons} />
        </View>
        <View>
          <MainText style={styles.title}>Email Address</MainText>
          <MainText style={[styles.value, styles.link]}>
            {company?.supportEmail}
          </MainText>
        </View>
      </Pressable>

      <Pressable
        onPress={() => openWebsite(website)}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.iconview}>
          <Image source={icons.globeoutline} style={styles.icons} />
        </View>
        <View>
          <MainText style={styles.title}>Visit Our Website</MainText>
          <MainText style={[styles.value, styles.link]}>{website}</MainText>
        </View>
      </Pressable>

      <Pressable
        onPress={() => openWhatsAppOrCall(company?.whatsappNumber)}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.iconview}>
          <Image source={icons.phoneoutline} style={styles.icons} />
        </View>
        <View>
          <MainText style={styles.title}>
            Talk to Us – WhatsApp or Call
          </MainText>
          <MainText style={[styles.value, styles.link]}>
            {company?.whatsappNumber}
          </MainText>
        </View>
      </Pressable>
    </MainView>
  );
};

export default Support;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: fontSize(7),
    paddingHorizontal: SIZES.width * 0.04,
    paddingVertical: SIZES.width * 0.03,

    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.width * 0.05,
    marginBottom: SIZES.height * 0.01,
  },
  title: {
    fontSize: fontSize(12),
    color: COLORS.borderLight,
  },
  value: {
    fontSize: fontSize(16),
    fontFamily: FONTS.semiBold,
  },
  iconview: {
    width: SIZES.width * 0.1,
    paddingRight: 15,
    marginRight: 15,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
  },
  icons: {
    width: SIZES.width * 0.07,
    height: SIZES.width * 0.1,
    resizeMode: 'contain',
  },
  link: {
    // color: COLORS.primary,
    // textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.7,
  },
});
