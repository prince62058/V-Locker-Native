import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MainText from '../MainText';
import { COLORS, FONTS, icons, SIZES } from '../../constants';
import { fontSize } from '../../utils/fontSize';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

const BankCard = ({ item, onPress, onDelete }) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.flexRow}>
        <Image source={icons.bank} style={styles.icons} />
        <View>
          <MainText style={styles.title}>Bank Name:</MainText>
          <MainText style={styles.value}>{item?.bankName}</MainText>
        </View>
      </View>
      <View style={styles.flexRow}>
        <Image source={icons.avatar} style={styles.icons} />
        <View>
          <MainText style={styles.title}>Account Holder Name:</MainText>
          <MainText style={styles.value}>{item?.accountHolderName}</MainText>
        </View>
      </View>
      <View style={styles.flexRow}>
        <Image source={icons.accounts} style={styles.icons} />
        <View>
          <MainText style={styles.title}>Account Number:</MainText>
          <MainText style={styles.value}>{item?.accountNumber}</MainText>
        </View>
      </View>
      <View style={styles.flexRow}>
        <Image
          source={icons.bankDetails}
          style={[styles.icons, { tintColor: COLORS.primary }]}
        />
        <View>
          <MainText style={styles.title}>IFSC Code:</MainText>
          <MainText style={styles.value}>{item?.ifscCode}</MainText>
        </View>
      </View>
      {item?.upiId && (
        <View style={styles.flexRow}>
          <Image
            source={icons.bankDetails}
            style={[styles.icons, { tintColor: COLORS.primary }]}
          />
          <View>
            <MainText style={styles.title}>UPI ID:</MainText>
            <MainText style={styles.value}>{item?.upiId}</MainText>
          </View>
        </View>
      )}

      <Pressable
        style={styles.delete}
        onPress={onDelete}
        android_ripple={{
          color: COLORS.black,
          // foreground: true,
          radius: 50,
        }}
      >
        <MaterialIcons
          name="delete-outline"
          size={fontSize(25)}
          color={COLORS.white}
        />
      </Pressable>
    </Pressable>
  );
};

export default BankCard;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: SIZES.width * 0.05,
    backgroundColor: COLORS.lightBlack,
    paddingVertical: SIZES.height * 0.02,
    borderRadius: fontSize(7),
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icons: {
    width: SIZES.width * 0.07,
    height: SIZES.width * 0.07,
    marginRight: 10,
  },
  title: {
    fontSize: fontSize(12),
    color: COLORS.borderLight,
  },
  value: {
    fontSize: fontSize(16),
    fontFamily: FONTS.semiBold,
  },
  delete: {
    // backgroundColor: 'red',
    alignSelf: 'flex-end',
    padding: fontSize(5),
    borderRadius: 100,
    overflow: 'hidden',
  },
});
