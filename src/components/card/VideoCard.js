import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MainText from '../MainText'
import { COLORS, FONTS, SIZES } from '../../constants'
import { fontSize } from '../../utils/fontSize'
import Seperator from '../common/seperator/Seperator'

const VideoCard = ({ item, onPress }) => {
    return (
        <Pressable style={styles.container} onPress={onPress}>
            <View style={styles.thumbnail}>
                <Image source={{ uri: item?.thumbnail }} style={{ width: '100%', height: '100%' }} />
            </View>
            <Seperator />
            <View style={styles.flexRow}>
                <View style={styles.avatar}>
                    <Image source={item?.channelImage ? { uri: item?.channelImage } : require('../../assets/logo.png')} style={{ width: '100%', height: '100%' }} resizeMode='contain' />
                </View>
                <View >
                    <MainText numberOfLines={1} style={styles.title} noOfColumn>{item.title}</MainText>
                    <MainText style={styles.desc}>{item.description}</MainText>
                </View>
            </View>
        </Pressable>
    )
}

export default VideoCard

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    thumbnail: {
        backgroundColor: COLORS.primary,
        height: SIZES.height * 0.17,
        borderRadius: fontSize(7),
    },
    flexRow: {
        flexDirection: 'row',
        overflow: 'hidden',
    },
    avatar: {
        width: SIZES.width * 0.13,
        height: SIZES.width * 0.13,
        backgroundColor: COLORS.lightBlack,
        borderRadius: 100,
        marginRight: 10
    },
    title: {
        fontSize: fontSize(16),
        fontFamily: FONTS.medium,
        marginBottom: -3,
    },
    desc: {
        fontSize: fontSize(12),
        color: COLORS.borderLight
    }
})