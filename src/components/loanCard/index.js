import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MainText from '../MainText';
import { SIZES, COLORS, FONTS, icons } from '../../constants';
import { fontSize } from '../../utils/fontSize';

const LoanCard = ({ icon, gradientColors, text, onPress }) => {
    return (
        <Pressable style={styles.loanCard} onPress={onPress}>
            <View style={styles.flex}>
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.iconView}
                >
                    <Image style={styles.iconStyle} source={icon} />
                </LinearGradient>
                <MainText style={styles.text}>{text}</MainText>
            </View>
            <Image style={styles.arrowIcon} source={icons.rightArrow} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    loanCard: {
        paddingHorizontal: SIZES.body5,
        paddingVertical: SIZES.height * 0.014,
        borderRadius: SIZES.radius,
        borderWidth: 0.5,
        borderColor: COLORS.borderLight,
        backgroundColor: COLORS.lightBlack,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    flex: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.width * 0.04,
    },
    text: {
        color: COLORS.headingText,
        fontFamily: FONTS.regular,
        fontSize: fontSize(14),
    },
    iconView: {
        alignItems: 'center',
        justifyContent: 'center',
        width: SIZES.width * 0.14,
        height: SIZES.width * 0.14,
        borderRadius: SIZES.radius01,
    },
    iconStyle: {
        height: SIZES.width * 0.085,
        width: SIZES.width * 0.085,
        resizeMode: 'contain',
    },
    arrowIcon: {
        height: SIZES.width * 0.04,
        width: SIZES.width * 0.04,
        resizeMode: 'contain',
    },
});

export default LoanCard;
