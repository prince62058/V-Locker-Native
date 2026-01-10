import { StyleSheet, Text, View, Modal, Pressable } from 'react-native'
import React from 'react'
import MainText from '../MainText'
import { COLORS, FONTS, SIZES } from '../../constants'
import { fontSize } from '../../utils/fontSize'
import SubmitButton from '../common/button/SubmitButton'

const DeviceLockModal = ({ visible = false, handleConfirm, handleModalToggle, item = {} }) => {
    const textValue = item?.lockedStatus ? 'Unlock' : 'Lock'

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
                    <MainText style={styles.title}>Lock Device?</MainText>

                    <MainText style={styles.desc}>
                        {`Are you sure you want to ${textValue} this device?`}
                    </MainText>

                    <View style={styles.buttonRow}>
                        <SubmitButton
                            title='Cancle'
                            onPress={handleModalToggle}
                            mainStyle={styles.cancel}
                        />
                        <SubmitButton
                            title={textValue}
                            onPress={handleConfirm}
                            mainStyle={styles.button}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default DeviceLockModal

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(151, 148, 148, 0.3)',
    },
    centerWrapper: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: SIZES.width * 0.9,
        backgroundColor: COLORS.black,
        paddingHorizontal: SIZES.width * 0.08,
        paddingVertical: SIZES.width * 0.04,
        borderRadius: 15,
    },

    title: {
        fontSize: fontSize(20),
        fontFamily: FONTS.medium,
        marginBottom: -3,
        marginTop: SIZES.height * 0.02,
    },
    desc: {
        fontSize: fontSize(15),
        color: COLORS.borderLight,
    },

    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    button: {
        width: '48%',
        marginHorizontal: 0,
    },
    cancel: {
        backgroundColor: COLORS.black,
        width: '48%',
        height: SIZES.height * 0.06,
        borderWidth: 1,
        borderColor: COLORS.white,
        marginHorizontal: 0,
    },
})
