import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MainText from '../../MainText'
import { COLORS, FONTS, icons, SIZES } from '../../../constants'
import { fontSize } from '../../../utils/fontSize'

const AddButton = ({ title = 'Add', onPress, mainStyle }) => {
    return (
        <Pressable style={[styles.container, mainStyle]} onPress={onPress && onPress}>
            <Image source={icons.plus} style={styles.icons} />
            <MainText style={styles.text}>{title}</MainText>
        </Pressable>
    )
}

export default AddButton

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.width * 0.015,
        paddingHorizontal: SIZES.width * 0.03,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // height: SIZES.height * 0.06,
        alignSelf: 'flex-end',
        marginRight: SIZES.width * 0.05,
        borderRadius: fontSize(7)
    },
    icons: {
        width: SIZES.width * 0.04,
        height: SIZES.width * 0.04,
        marginRight: 10
    },
    text: {
        fontFamily: FONTS.medium,
        fontSize: fontSize(16)
    }
})