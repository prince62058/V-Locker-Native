import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { COLORS, FONTS, SIZES } from "../../constants";
import { fontSize } from "../../utils/fontSize";
import MainText from '../MainText';

const CustomView = ({ label1, value1, label2, value2 }) => {
    const isSingle = !label2 && !value2;

    return (
        <View style={[styles.row, isSingle && styles.centerRow]}>
            <View style={[styles.box, isSingle && styles.singleBox]}>
                <MainText style={styles.label}>{label1}</MainText>
                <MainText style={styles.value}>{value1}</MainText>
            </View>

            {!isSingle && (
                <View style={styles.box}>
                    <MainText style={styles.label}>{label2}</MainText>
                    <MainText style={styles.value}>{value2}</MainText>
                </View>
            )}
        </View>
    )
}

export default CustomView

const styles = StyleSheet.create({
    row: {
        borderWidth: 0.5,
        borderColor: COLORS.border,
        borderRadius: 8,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        marginTop: SIZES.height * 0.01,
        backgroundColor: COLORS.lightBlack,
    },
    centerRow: {
        alignItems: 'flex-start',
    },
    box: {
        width: '50%',
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginVertical: SIZES.height * 0.01,
        paddingHorizontal: SIZES.width * 0.03,

    },
    singleBox: {
        width: '95%',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    label: {
        fontFamily: FONTS.regular,
        fontSize: fontSize(14),
        color: '#989898',
    },
    value: {
        fontFamily: FONTS.bold,
        fontSize: fontSize(13),
        // color: COLORS.placeholder,
        textAlign: 'center',
    },

})