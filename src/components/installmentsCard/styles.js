import { StyleSheet } from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants";
import { fontSize } from "../../utils/fontSize";

export default StyleSheet.create({
    customView: {
        width: SIZES.width * 0.9,
        elevation: 4,
        borderRadius: SIZES.h4,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        paddingHorizontal: SIZES.width * 0.06,
        paddingVertical: SIZES.height * 0.02,
        marginTop: SIZES.height * 0.01,
    },
    flex: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.width * 0.01,
    },
    right: {
        alignItems: 'flex-end',
    },
    boldText: {
        fontSize: fontSize(16),
        fontFamily: FONTS.bold,
        color: COLORS.white,
    },
    text: {
        fontSize: fontSize(16),
        fontFamily: FONTS.regular,
        color: '#989898',
    },
    statusContainer: {
        marginTop: SIZES.height * 0.015,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBox: {
        marginHorizontal: SIZES.width * 0.02,
        backgroundColor: COLORS.border,
        paddingHorizontal: SIZES.width * 0.04,
        paddingVertical: SIZES.height * 0.005,
        borderRadius: 6,
    },
    status: {
        fontSize: fontSize(12),
        fontFamily: FONTS.bold,
        color: COLORS.black,
    },
    remarkText: {
        fontSize: fontSize(20),
        fontFamily: FONTS.regular,
        color: '#989898',
    },
    cashText: {
        fontSize: fontSize(30),
        fontFamily: FONTS.bold,
        color: COLORS.white,
    },
    cash: {
        textTransform: 'uppercase',
        fontSize: fontSize(16),
        fontFamily: FONTS.regular,
        color: '#989898',
        marginTop: SIZES.height * 0.012,
    },
});
