import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';
import { fontSize } from '../../utils/fontSize';

export default StyleSheet.create({
  customView: {
    width: SIZES.width * 0.9,
    elevation: 4,
    borderRadius: SIZES.h4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SIZES.width * 0.04,
    paddingVertical: SIZES.height * 0.0125,
    marginVertical: SIZES.height * 0.02,
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loanText: {
    fontSize: fontSize(16),
    fontFamily: FONTS.regular,
    color: '#F8F9FB',
  },
  idText: {
    fontSize: fontSize(12),
    fontFamily: FONTS.bold,
    color: '#F8F9FB',
  },
  statusContainer: {
    marginVertical: SIZES.height * 0.01,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBox: {
    // marginHorizontal: SIZES.width * 0.02,
    backgroundColor: COLORS.border,
    paddingHorizontal: SIZES.width * 0.02,
    paddingVertical: SIZES.height * 0.003,
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
    fontSize: fontSize(10),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    width: SIZES.width * 0.5,
  },
  text: {
    fontSize: fontSize(12),
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
  editBtn: {
    backgroundColor: '#5356FF',
    paddingHorizontal: SIZES.width * 0.03,
    paddingVertical: SIZES.height * 0.005,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  editBtnText: {
    fontSize: fontSize(12),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  editIcon: {
    height: fontSize(10),
    width: fontSize(10),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
});
