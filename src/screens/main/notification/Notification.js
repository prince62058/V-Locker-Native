import { useCallback, useEffect } from 'react'
import {
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import Loader from '../../../components/common/loader/Loader'
import Nodata from '../../../components/common/nodata/Nodata'
import Seperator from '../../../components/common/seperator/Seperator'
import CustomHeader from '../../../components/header/CustomHeader'
import MainText from '../../../components/MainText'
import MainView from '../../../components/MainView'
import { COLORS, FONTS, icons, SIZES } from '../../../constants'
import { getItemDetailsThunk, getNotificationListThunk } from '../../../redux/slices/main/notificationSlice'
import { fontSize } from '../../../utils/fontSize'
import { dateOrTimeFormat } from '../../../utils/formating/date'

const NotificationCard = ({ item, onPress }) => (
    <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
                <Image style={styles.icon} source={icons.support} />
            </View>

            <View style={styles.textSection}>
                <MainText style={styles.title}>{item?.title}</MainText>
                <MainText style={styles.subtitle}>{item?.body}</MainText>
                <MainText style={styles.time}>{dateOrTimeFormat(item?.createdAt)}</MainText>
            </View>
        </View>

        {!item?.readStatus && <View style={styles.unreadIndicator} />}
    </Pressable>
)


const Notification = () => {

    const dispatch = useDispatch()
    const { loading, listData, pagination, itemDetails } = useSelector(state => state.notification)
    console.log('itemDetails', itemDetails)

    const fetchData = useCallback(
        ({ isRefresh = false, page = 1, search = '', filter = '' }) => {
            dispatch(getNotificationListThunk({ isRefresh, page, search, filter }))
        },
        [dispatch],
    )

    useEffect(() => {
        fetchData({})
    }, [fetchData])

    const onRefresh = useCallback(() => {
        fetchData({ isRefresh: true })
    }, [fetchData])

    const handlePagination = useCallback(() => {
        const isLoading = loading?.pagination || loading?.loading
        if (isLoading) return

        const { currentPage = 1, totalPages = 1 } = pagination || {}
        if (currentPage >= totalPages) return

        fetchData({ page: currentPage + 1 })
    }, [loading, pagination, fetchData])

    const renderItem = ({ item }) => <NotificationCard item={item} onPress={() => onItemPress(item)} />


    const onItemPress = (item) => {
        const isLoading = loading?.pagination || loading?.loading
        if (!item || isLoading) return
        dispatch(getItemDetailsThunk({ notificationId: item?._id }))
        // console.log('notification id, ', { notificationId: item?._id })
    }

    return (
        <MainView transparent={false}>
            <CustomHeader title="Notification" />

            {loading.loading && !listData?.length ? (
                <Loader />
            ) : (
                <FlatList
                    data={listData}
                    keyExtractor={item => item?._id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handlePagination}
                    onEndReachedThreshold={0.1}
                    ItemSeparatorComponent={() => <Seperator height={SIZES.height * 0.01} />}
                    ListEmptyComponent={<Nodata />}
                    ListHeaderComponent={
                        <Pressable
                            style={styles.markAllContainer}
                            onPress={() => console.log('Mark all as read')}>
                            <MainText style={styles.markAllText}>Mark all as read</MainText>
                        </Pressable>
                    }
                    refreshControl={
                        <RefreshControl refreshing={loading?.refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={
                        listData?.length > 0
                            ? styles.contentContainer
                            : styles.emptyContainer
                    }
                />
            )}
        </MainView>
    )
}

export default Notification

const styles = StyleSheet.create({
    markAllContainer: {
        alignItems: 'flex-end',
        marginBottom: SIZES.height * 0.02,
        marginRight: SIZES.body2,
    },
    markAllText: {
        fontSize: fontSize(16),
        color: COLORS.primary,
        fontFamily: FONTS.bold,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.lightBlack,
        borderRadius: SIZES.radius,
        paddingVertical: SIZES.height * 0.015,
        paddingHorizontal: SIZES.width * 0.04,
        shadowColor: '#2f2c2cff',
        shadowRadius: 3,
        elevation: 5,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        width: SIZES.width * 0.115,
        height: SIZES.width * 0.115,
        borderRadius: SIZES.radius01,
    },
    icon: {
        height: SIZES.width * 0.064,
        width: SIZES.width * 0.064,
        resizeMode: 'contain',
    },
    textSection: {
        marginHorizontal: SIZES.width * 0.04,
        flex: 1,
        gap: SIZES.width * 0.004,
    },
    title: {
        color: COLORS.headingText,
        fontFamily: FONTS.bold,
        fontSize: fontSize(16),
    },
    subtitle: {
        color: COLORS.borderLight,
        fontFamily: FONTS.regular,
        fontSize: fontSize(12),
    },
    time: {
        color: COLORS.borderLight,
        fontFamily: FONTS.regular,
        fontSize: fontSize(11),
    },
    unreadIndicator: {
        height: SIZES.width * 0.02,
        width: SIZES.width * 0.02,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
    },

    contentContainer: {
        paddingHorizontal: SIZES.width * 0.05,
    },
    emptyContainer: {
        flex: 1,
    },
})
