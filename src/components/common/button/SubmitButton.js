import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MainText from '../../MainText'
import { COLORS, FONTS, SIZES } from '../../../constants'
import { fontSize } from '../../../utils/fontSize'

const SubmitButton = ({ title = 'Button', loading = false, disabled = false, onPress, mainStyle }) => {
    return (
        <Pressable
            style={[styles.container, { backgroundColor: (disabled || loading) ? `${COLORS.primary}90` : COLORS.primary }, mainStyle]}
            onPress={onPress} disabled={loading || disabled}
        >
            {loading
                ?
                <ActivityIndicator size={fontSize(35)} color={COLORS.white} />
                :
                <MainText style={styles.title}>{title}</MainText>
            }
        </Pressable>
    )
}

export default SubmitButton

const styles = StyleSheet.create({
    container: {
        height: SIZES.height * 0.065,
        width: SIZES.width * 0.9,
        marginHorizontal: SIZES.width * 0.05,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fontSize(8),
    },
    title: {
        fontSize: fontSize(18),
        fontFamily: FONTS.medium
    },
})