import { StyleSheet, Text, View, Modal, Pressable, Image } from 'react-native'
import React from 'react'
import MainText from '../MainText'
import { COLORS, FONTS, images, SIZES } from '../../constants'
import { fontSize } from '../../utils/fontSize'
import SubmitButton from '../common/button/SubmitButton'
import { useNavigation } from '@react-navigation/native'

const LogoutModal = ({ visible = false, onRequestClose, handleLogout }) => {
    const navigation = useNavigation()
    const handleHomePress = () => {
        onRequestClose()
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
                    <Image source={images.logout} style={styles.image} />
                    <MainText style={styles.title}>Logout</MainText>
                    <MainText style={styles.desc}>Are you sure you want to logout? </MainText>
                    <SubmitButton
                        title='Logout'
                        onPress={handleLogout}
                        mainStyle={styles.button}
                    />
                    <SubmitButton
                        title='Cancel'
                        onPress={onRequestClose}
                        mainStyle={styles.cancle}
                       
                    />

                </View>
            </View>

        </Modal>
    )
}

export default LogoutModal

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
    },
    cancle: {
        backgroundColor: COLORS.black,
        width: '90%',
        height: SIZES.height * 0.05,
        marginTop: SIZES.height * 0.02
        
    }
})