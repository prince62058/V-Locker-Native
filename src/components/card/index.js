import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SIZES, FONTS, COLORS } from '../../constants';
import MainText from '../MainText';
import { fontSize } from '../../utils/fontSize';

const StatsCard = ({ 
  count, 
  text, 
  bgColor, 
  icon, 
  gradientColors,
  onPress
}) => {
  return (
    <Pressable style={[styles.card, { backgroundColor: bgColor }]} onPress={onPress}>
      <View style={styles.flex}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.iconView}
        >
          <Image style={styles.iconStyle} source={icon} />
        </LinearGradient>
        <MainText style={styles.count}>{count}</MainText>
      </View>
      <MainText style={styles.text}>{text}</MainText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: SIZES.body2,
    height: SIZES.height * 0.15,
    padding: SIZES.body5,
    width: '49%',
    // width: SIZES.width * 0.45,
    borderRadius: SIZES.radius,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    gap: SIZES.height * 0.02,
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  count: {
    marginRight: SIZES.width * 0.06, 
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(24),
  },
  text: {
    color: COLORS.headingText,
    fontFamily: FONTS.regular,
    fontSize: fontSize(14),
  },
  iconView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZES.width * 0.1333,
    height: SIZES.width * 0.1333,
    borderRadius: SIZES.radius01,
  },
  iconStyle: {
    height: SIZES.width * 0.085,
    width: SIZES.width * 0.085,
    resizeMode: 'contain',
  },
});

export default StatsCard;
