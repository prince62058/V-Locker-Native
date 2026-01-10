import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS } from '../../constants'
import { dateFormate, timeFormate } from '../../utils/formating/date'
import { Ionicons } from '@react-native-vector-icons/ionicons'

// Choose relevant Ionicons for each status
const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending':
            return 'time-outline' // or 'hourglass-outline'
        case 'approved':
            return 'checkmark-circle-outline'
        case 'rejected':
            return 'close-circle-outline'
        default:
            return 'information-circle-outline'
    }
}

const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending':
            return { bg: '#FFF7D6', text: '#B28913' }
        case 'rejected':
            return { bg: '#FFE3E3', text: '#CB3636' }
        case 'approved':
            return { bg: '#D4F6E6', text: '#16734E' }
        default:
            return { bg: '#E5E7EB', text: '#495057' }
    }
}

const ReasonText = ({ reason }) => {
    const [expanded, setExpanded] = useState(false)
    const [lengthMore, setLengthMore] = useState(false)

    const onTextLayout = useCallback(e => {
        setLengthMore(e.nativeEvent.lines.length > 2)
    }, [])

    if (!reason) return null

    return (
        <View>
            <Text
                style={styles.reasonText}
                numberOfLines={expanded ? undefined : 2}
                onTextLayout={onTextLayout}
            >
                Reason: {reason}
            </Text>
            {lengthMore ? (
                <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                    <Text style={styles.seeMoreText}>{expanded ? 'See less' : 'See more'}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    )
}

const KeysCard = ({ item }) => {
    const { status, requestKeys, createdAt, reason } = item
    const statusStyle = getStatusStyle(status)
    const statusIcon = getStatusIcon(status)

    return (
        <View style={styles.card}>
            <View style={[styles.row, styles.justify]}>
                <View style={[styles.statusContainer, { backgroundColor: statusStyle.bg, flexDirection: 'row', alignItems: 'center' }]}>
                    <Ionicons name={statusIcon} size={16} color={statusStyle.text} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>{status}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="time-outline" size={14} color={styles.dateText.color} style={{ marginRight: 2 }} />
                    <Text style={styles.dateText}>{dateFormate(createdAt)} {timeFormate(createdAt)}</Text>
                </View>
            </View>

            <Text style={styles.title} numberOfLines={1}>
                Keys Requested: <Text style={{ fontWeight: 'bold' }}>{requestKeys}</Text>
            </Text>
            <ReasonText reason={reason} />
        </View>
    )
}


const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.lightBlack,
        borderRadius: 16,
        borderColor: '#F2F2F4',
        padding: 18,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    justify: {
        justifyContent: 'space-between'
    },
    statusContainer: {
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 5,
        minWidth: 70,
        alignItems: 'center',
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: 13,
        textTransform: 'capitalize',
        letterSpacing: 0.5,
    },
    title: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    reasonText: {
        marginTop: 4,
        fontSize: 14,
        color: '#667085',
        fontStyle: 'italic',
    },
    seeMoreText: {
        color: COLORS.primary ?? '#2F80ED', // fallback to a blue shade if primary not set
        marginTop: 2,
        fontWeight: '600',
        fontSize: 13,
    },
})

export default KeysCard
