import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import MainText from '../MainText';
import { SIZES, COLORS, FONTS, icons } from '../../constants';
import { fontSize } from '../../utils/fontSize';


const ProfileCard = ({ icon, title, subtitle, onPress, titleStyle }) => {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.leftSection}>
                <View style={styles.iconContainer}>
                    <Image style={styles.icon} source={icon} />
                </View>
                <View>
                    <MainText style={[styles.title, titleStyle]}>{title}</MainText>
                    <MainText style={styles.subtitle}>{subtitle}</MainText>
                </View>
            </View>

            <Image style={styles.arrow} source={icons.rightArrow} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        marginTop: SIZES.height * 0.008,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.lightBlack,
        borderRadius: SIZES.radius,
        paddingVertical: SIZES.height * 0.015,
        paddingHorizontal: SIZES.width * 0.035,
        shadowColor: '#2f2c2cff',
        shadowRadius: 3,
        elevation: 5,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.width * 0.04,
    },
    iconContainer: {
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        width: SIZES.width * 0.115,
        height: SIZES.width * 0.115,
        borderRadius: SIZES.radius01,
    },
    icon: {
        height: SIZES.width * 0.064,
        width: SIZES.width * 0.064,
        resizeMode: 'contain',
    },
    title: {
        color: COLORS.headingText,
        fontFamily: FONTS.medium,
        fontSize: fontSize(16),
    },
    subtitle: {
        color: COLORS.borderLight,
        fontFamily: FONTS.regular,
        fontSize: fontSize(12),
        marginTop: 2,
    },
    arrow: {
        height: SIZES.width * 0.04,
        width: SIZES.width * 0.04,
        resizeMode: 'contain',
    },
});

export default ProfileCard;
