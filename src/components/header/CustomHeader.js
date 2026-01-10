import { Pressable, StyleSheet, Text, View } from 'react-native'
import { COLORS, SIZES, FONTS } from '../../constants'
import { fontSize } from '../../utils/fontSize'
import { MaterialIcons } from '@react-native-vector-icons/material-icons'
import { useNavigation } from '@react-navigation/native'

const CustomHeader = ({ title, back }) => {
    const navigation = useNavigation()
    const handleBack = () => {
        navigation.goBack()
    }
    return (
        <View style={styles.container}>
            {back && (
                <Pressable style={styles.back}
                    onPress={handleBack}
                    android_ripple={{
                        color: `${COLORS.border}` + 90, // light ripple tint
                        borderless: false,
                        foreground: true,
                        radius: 100
                    }}>
                    <MaterialIcons name='arrow-back' color={COLORS.white} size={fontSize(20)} />
                </Pressable>
            )}
            <Text style={styles.text}>{title}</Text>
        </View>
    )
}

export default CustomHeader

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SIZES.width * 0.05,
        height: SIZES.height * 0.06,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.black
    },
    back: {
        width: SIZES.width * 0.09,
        height: SIZES.width * 0.09,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: SIZES.width * 0.09 / 2,
        marginRight: 5,
        overflow: 'hidden'
    },
    text: {
        color: COLORS.white,
        fontFamily: FONTS.medium,
        marginBottom: -3,
        fontSize: fontSize(16)
    }
})