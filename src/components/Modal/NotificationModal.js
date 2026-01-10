import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const NotificationModal = ({ visible = false }) => {
    return (
        <Modal
            visible={visible}
        >
            <Text>NotificationModal</Text>
        </Modal>
    )
}

export default NotificationModal

const styles = StyleSheet.create({})