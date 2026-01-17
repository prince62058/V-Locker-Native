import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import MainText from '../MainText';
import { COLORS, FONTS, icons, images, SIZES } from '../../constants';
import { fontSize } from '../../utils/fontSize';
import Seperator from '../common/seperator/Seperator';
import ToggleButton from '../common/button/ToggleButton';

const LockDeviceCard = ({ item, onPress }) => {
  const status = ['Online', 'Active'].includes(item.dataStatus);

  return (
    <View style={styles.container}>
      <View style={styles.flex}>
        <View style={[styles.flex, { justifyContent: 'flex-start' }]}>
          <Image source={icons.iphone} style={styles.cardIcon} />
          <MainText style={styles.devicename}>{item?.deviceName}</MainText>
        </View>
        <View>
          <ToggleButton
            value={item?.lockedStatus}
            onPress={() => onPress(item)}
          />
        </View>
      </View>
      <Seperator />

      <View style={[styles.flex, { justifyContent: 'flex-start' }]}>
        <MainText>Data Status: </MainText>
        <MainText
          style={[
            styles.status,
            { backgroundColor: status ? COLORS.green : COLORS.borderLight },
          ]}
        >
          {item.dataStatus}
        </MainText>
      </View>
      <Seperator />

      <View style={styles.flex}>
        <View style={[styles.flex, { justifyContent: 'flex-start' }]}>
          <Image source={images.avatar} style={styles.avatar} />
          <View style={{ marginLeft: 10 }}>
            <MainText style={styles.name}>{item.name}</MainText>
            <MainText style={styles.phone}>{item.phone}</MainText>
          </View>
        </View>

        <View>
          <MainText style={styles.loan}>LOAN ID</MainText>
          <MainText style={styles.loanvalue}>{item.loanId}</MainText>
        </View>
      </View>
      <Seperator height={SIZES.height * 0.02} />

      <View style={styles.flex}>
        <View style={styles.emiCard}>
          <View style={[styles.flex, { justifyContent: 'flex-start' }]}>
            <Image source={icons.calendar_red} style={styles.cardIcon} />
            <MainText style={[styles.redTitle, { marginLeft: 5 }]}>
              Due date
            </MainText>
          </View>
          <MainText style={styles.date}>{item.dueDate}</MainText>
        </View>

        <View style={styles.emiCard}>
          <View style={[styles.flex, { justifyContent: 'flex-start' }]}>
            <MainText style={styles.redTitle}>Amount Due EMI</MainText>
          </View>
          <MainText style={styles.date}>{item.amountDue}</MainText>
          <MainText style={styles.freq}>{item.frequency}</MainText>
        </View>
      </View>

      {status && (
        <View style={styles.noteview}>
          <View style={styles.redbadge} />
          <MainText style={styles.note}>{item.note}</MainText>
        </View>
      )}
    </View>
  );
};

export default LockDeviceCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.lightBlack,
    borderRadius: fontSize(14),
    paddingHorizontal: fontSize(14),
    paddingVertical: fontSize(24),
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: fontSize(48),
    height: fontSize(48),
  },
  cardIcon: {
    width: fontSize(20),
    height: fontSize(20),
  },
  emiCard: {
    backgroundColor: COLORS.black,
    paddingHorizontal: fontSize(16),
    paddingVertical: fontSize(10),
    width: SIZES.width * 0.4,
    height: SIZES.height * 0.12,
    borderRadius: fontSize(12),
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  devicename: {
    color: COLORS.sky,
    fontSize: fontSize(16),
    fontFamily: FONTS.medium,
    marginLeft: 10,
  },
  status: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: fontSize(5),
    fontSize: fontSize(12),
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  name: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(18),
  },
  phone: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(15),
    color: COLORS.primary,
  },
  loan: {
    // fontFamily: FONTS.medium,
    fontSize: fontSize(12),
  },
  loanvalue: {
    fontFamily: FONTS.medium,
    fontSize: fontSize(18),
    textAlign: 'right',
  },
  redTitle: {
    fontSize: fontSize(13),
    color: COLORS.primaryred,
    fontFamily: FONTS.medium,
  },
  date: {
    marginTop: 5,
    fontSize: fontSize(15),
    fontFamily: FONTS.medium,
  },
  freq: {
    color: COLORS.borderLight,
    fontSize: fontSize(12),
  },
  noteview: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  note: {
    fontSize: fontSize(12),
  },
  redbadge: {
    backgroundColor: COLORS.red,
    width: 12,
    height: 12,
    borderRadius: 10,
    marginRight: 10,
  },
});
