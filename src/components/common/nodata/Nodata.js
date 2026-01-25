import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import MainText from '../../MainText'
import { fontSize } from '../../../utils/fontSize'
import { COLORS, FONTS, SIZES } from '../../../constants'
import Seperator from '../seperator/Seperator'

const Nodata = ({ top, custom, onPress }) => {
    return (
        <View style={[styles.container, top && { paddingTop: top }]}>
            {custom ? (
                <View style={styles.customWrapper}>
                    <Image
                        source={require('../../../assets/images/nodata.png')}
                        style={styles.noDataImage}
                    />

                    <MainText style={styles.text}>Nothing Here Yet!</MainText>
                    <MainText style={styles.desc}>Try adding or checking back later.</MainText>
                    <Seperator />

                    {onPress && (
                        <Pressable style={styles.addBtn} onPress={onPress}>
                            <Text style={styles.addBtnText}>Add Customer</Text>
                        </Pressable>
                    )}
                </View>
            ) : (
                <MainText style={styles.text}>No data available</MainText>
            )}
        </View>
    )
}

export default Nodata

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    customWrapper: {
        marginTop: -SIZES.height * 0.1,
        alignItems: 'center',
    },

    noDataImage: {
        width: SIZES.width * 0.5,
        height: SIZES.width * 0.5,
    },

    text: {
        fontSize: fontSize(20),
        fontFamily: FONTS.semiBold,
        color: COLORS.white,
    },

    desc: {
        fontSize: fontSize(12),
        color: COLORS.white,
    },

    addBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.height * 0.01,
        paddingHorizontal: SIZES.width * 0.03,
        borderRadius: fontSize(5),
    },

    addBtnText: {
        color: COLORS.white,
        fontFamily: FONTS.medium,
        fontSize: fontSize(14),
    },
})
