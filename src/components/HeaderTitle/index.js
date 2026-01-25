import React, { useState } from 'react'
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, StatusBar } from 'react-native'
import { COLORS, FONTS, SIZES } from '../../constants'



const HeaderTitle = ({ children }) => {
    return (
        <Text style={styles.headerTitleText} numberOfLines={1}>{children}</Text>
    )
}

export default HeaderTitle



const styles = StyleSheet.create({
    headerTitleText: {
        color: COLORS.white,
        fontFamily: FONTS.semiBold,
        fontSize: SIZES.width * .055,
        marginLeft: -SIZES.width * .012,
        width:SIZES.width*.74,
    }
})