import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';
import { fontSize } from '../../utils/fontSize';

export default StyleSheet.create({
  customView: {
    // height: SIZES.height * 0.5,
    width: SIZES.width * 0.9,
    elevation: 4,
    borderRadius: SIZES.h4,
    backgroundColor: COLORS.lightBlack,
    paddingHorizontal: SIZES.width * 0.04,
    paddingVertical: SIZES.height * 0.02,
    // marginVertical: SIZES.height * 0.015,
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  leftSection: {
    marginBottom: SIZES.height * 0.014,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.width * 0.02,
  },

  profile: {
    height: SIZES.width * 0.15,
    width: SIZES.width * 0.15,
    borderRadius: 50,
    backgroundColor: COLORS.border,
  },

  nameSection: {
    marginLeft: SIZES.width * 0.01,
  },

  loanSection: {
    alignItems: 'flex-end',
  },
  loanText: {
    fontSize: fontSize(16),
    fontFamily: FONTS.regular,
    color: COLORS.borderLight,
  },
  idText: {
    fontSize: fontSize(12),
    fontFamily: FONTS.bold,
    color: COLORS.borderLight,
  },
  statusContainer: {
    marginVertical: SIZES.height * 0.01,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBox: {
    marginHorizontal: SIZES.width * 0.02,
    backgroundColor: COLORS.border,
    paddingHorizontal: SIZES.width * 0.05,
    paddingVertical: SIZES.height * 0.001,
    borderRadius: 6,
  },
  IMEIBox: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    width: '100%',
    borderRadius: SIZES.h4,
    padding: SIZES.width * 0.04,
    marginTop: SIZES.height * 0.015,
    gap: SIZES.height * 0.012,
  },
  iphone: {
    height: SIZES.width * 0.06,
    width: SIZES.width * 0.06,
    resizeMode: 'contain',
    marginRight: SIZES.width * 0.005,
  },
  virtical: {
    marginTop: SIZES.height * 0.005,
  },
  boldText: {
    fontSize: fontSize(20),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  text: {
    // fontSize: fontSize(16),
    fontFamily: FONTS.regular,
  },

  modalText: {
    fontSize: fontSize(16),
    fontFamily: FONTS.bold,
    color: '#559EF0',
  },
  imeiText: {
    fontSize: fontSize(16),
    fontFamily: FONTS.regular,
    color: '#989898',
  },
  number: {
    fontSize: fontSize(15),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  moneyBox: {
    borderWidth: 1,
    borderColor: COLORS.green,
    borderRadius: SIZES.h4,
    padding: SIZES.width * 0.03,
    width: '48%',
    height: SIZES.height * 0.12,
    marginTop: SIZES.height * 0.015,
    gap: SIZES.height * 0.006,
  },
  moneyText: {
    fontSize: fontSize(16),
    fontFamily: FONTS.bold,
    color: COLORS.green,
  },
  number: {
    fontSize: fontSize(15),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});
