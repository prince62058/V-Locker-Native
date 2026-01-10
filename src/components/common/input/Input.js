import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { COLORS, FONTS, SIZES } from '../../../constants'
import { fontSize } from '../../../utils/fontSize'
import MainText from '../../MainText'

const Input = ({
    placeholder,
    value,
    onChangeText,
    maxLength,
    keyboardType,
    keyboardAppearance,
    mainStyle
}) => {


    const handleChange = (text) => {
        const digits = text.replace(/[^0-9]/g, '')
        onChangeText(digits)
    }

    return (
        <View style={styles.container}>
            <MainText style={styles.title}>{placeholder}</MainText>
            <View style={styles.flex}>
                <MainText style={styles.prefix}>+91 </MainText>
                <TextInput
                    value={value}
                    onChangeText={handleChange}
                    maxLength={maxLength}
                    keyboardType={keyboardType}
                    keyboardAppearance={keyboardAppearance}
                    style={[styles.input, mainStyle]}
                />
            </View>

        </View>
    )
}

export default Input

const styles = StyleSheet.create({
    container: {
        marginVertical: SIZES.height * 0.1,
        paddingHorizontal: SIZES.width * 0.1
    },
    title: {
        fontSize: fontSize(12),
        color: `${COLORS.white}90`,
        textAlign: 'center'
    },
    flex: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: fontSize(1),
        borderBottomColor: `${COLORS.white}90`,
    },
    prefix: {
        flex: 0.35,
        textAlign: 'right'
    },
    input: {
        flex: 0.65,
        height: SIZES.height * 0.06,
        color: COLORS.white,
        fontFamily: FONTS.regular,
        fontSize: fontSize(16),
    }
})