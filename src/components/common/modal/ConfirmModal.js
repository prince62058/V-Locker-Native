import React from 'react';
import {
    StyleSheet,
    View,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../../constants';

const ConfirmModal = ({ visible, onClose, onConfirm, title, desc, confirmText }) => {

    const handleOk = () => {
        onClose()
        onConfirm()
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} />

            <View style={styles.centerWrapper}>
                <View style={styles.container}>
                    <Text style={styles.title}>{title || `Delete Document`}</Text>
                    <Text style={styles.desc}>{desc || `Are you sure you want to delete the document , after this is not reversiable.`}</Text>
                    <View style={styles.buttonview}>
                        <TouchableOpacity onPress={onClose} style={styles.button}><Text style={styles.buttontext}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity onPress={handleOk} style={styles.button}><Text style={styles.buttontext}>{confirmText || `Ok`}</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmModal;

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    centerWrapper: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: SIZES.width * 0.9,
        backgroundColor: COLORS.lightBlack,     // always light
        borderRadius: 12,
        padding: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        paddingHorizontal: SIZES.width * 0.08
    },
    title: {
        fontFamily: FONTS.bold,
        fontSize: SIZES.width * 0.04,
        color: COLORS.white,
        marginTop: SIZES.height * 0.015
    },
    desc: {
        fontFamily: FONTS.semiBold,
        fontSize: SIZES.width * 0.03,
        color: `${COLORS.white}90`,
        marginTop: SIZES.height * 0.01,
    },
    buttonview: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        marginTop: SIZES.height * 0.01,
        marginBottom: SIZES.height * 0.015
    },
    button: {
        marginLeft: SIZES.width * 0.05,

    },
    buttontext: {
        fontFamily: FONTS.semiBold,
        fontSize: SIZES.width * 0.035,
        color: `${COLORS.primary}`
    }
});