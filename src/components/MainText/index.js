import { StyleSheet, Text } from 'react-native'
import { COLORS, FONTS } from '../../constants'
import { fontSize } from '../../utils/fontSize'

const MainText = ({ children, style, fallback = '', numberOfLines }) => {
    let displayText = fallback

    if (typeof children === 'string' || typeof children === 'number') {
        displayText = String(children)
    }

    return <Text numberOfLines={numberOfLines && numberOfLines} style={[styles.defaultText, style]}>{displayText}</Text>
}

const styles = StyleSheet.create({
    defaultText: {
        color: COLORS.white,
        fontFamily: FONTS.regular,
        fontSize: fontSize(13.5),
    },
})

export default MainText