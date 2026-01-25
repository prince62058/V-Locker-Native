import { StyleSheet, Text, View, Modal, Pressable, Image } from 'react-native'
import React from 'react'
import MainText from '../MainText'
import { COLORS, FONTS, images, SIZES } from '../../constants'
import { fontSize } from '../../utils/fontSize'
import SubmitButton from '../common/button/SubmitButton'
import { useNavigation } from '@react-navigation/native'

const FeedbackModal = ({ visible = false, onRequestClose }) => {
    const navigation = useNavigation()
    const handleHomePress = () => {
        onRequestClose()
        navigation.popToTop()
    }
    return (
        <Modal
            visible={visible}
            statusBarTranslucent
            transparent
            animationType='fade'
        >
            <Pressable style={styles.backdrop} />
            <View style={styles.centerWrapper}>
                <View style={styles.container}>
                    <Image source={images.success} style={styles.image} />
                    <MainText style={styles.title}>Thanks for feedback !</MainText>
                    <MainText style={styles.desc}>Hey there! We really appreciate you taking the time to share your thoughts with us.</MainText>
                    <SubmitButton
                        title='Go to Home'
                        onPress={handleHomePress}
                        mainStyle={styles.button}
                    />
                </View>
            </View>

        </Modal>
    )
}

export default FeedbackModal

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(151, 148, 148, 0.3)',
    },
    centerWrapper: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: SIZES.width * 0.9,
        backgroundColor: COLORS.black,
        paddingHorizontal: SIZES.width * 0.04,
        paddingVertical: SIZES.width * 0.05,
        borderRadius: 15,
        alignItems: 'center'
    },
    image: {
        width: SIZES.width * 0.35,
        height: SIZES.width * 0.35,
    },
    title: {
        fontSize: fontSize(18),
        fontFamily: FONTS.medium,
        marginBottom: -3,
        marginTop: SIZES.height * 0.02
    },
    desc: {
        fontSize: fontSize(13),
        color: COLORS.borderLight,
        textAlign: 'center'
    },
    button: {
        width: '90%'
    }
})