import { useCallback, useEffect } from 'react'
import { FlatList, RefreshControl, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'


import MainView from '../../../components/MainView'
import KeysCard from '../../../components/card/KeysCard'
import AddButton from '../../../components/common/button/AddButton'
import Loader from '../../../components/common/loader/Loader'
import Nodata from '../../../components/common/nodata/Nodata'
import Seperator from '../../../components/common/seperator/Seperator'
import CustomHeader from '../../../components/header/CustomHeader'
import { SIZES } from '../../../constants'
import { getKeyListThunk } from '../../../redux/slices/main/keySlice'
import { fontSize } from '../../../utils/fontSize'


const RequestKeys = ({ navigation }) => {

    const dispatch = useDispatch()
    const { keyData, loading, pagination } = useSelector(state => state.keys)
    // console.log('keys data ---> ', keyData, pagination)

    const fetchData = useCallback(({ isRefresh = false, page = 1, search = '' }) => {
        dispatch(getKeyListThunk({ isRefresh, page, search }))
    }, [dispatch])

    useEffect(() => {
        fetchData({})
    }, [fetchData])


    const onRefresh = useCallback(() => {
        fetchData({ isRefresh: true })
    }, [fetchData])

    const handlePagination = () => {
        // console.log('first')
        if (loading?.pagination || loading?.loading) return
        // console.log('second')
        if (pagination?.currentPage < pagination?.totalPages) {
            // console.log('third')
            fetchData({ page: Number(pagination?.currentPage) + 1 })
        }
    }

    const handleAddPress = () => {
        navigation.navigate('AddKeys')
    }

    return (
        <MainView transparent={false}>
            <CustomHeader title='Keys' back />

            {((loading?.loading && keyData?.length <= 0) || loading.search) ? (
                <Loader />
            ) : (
                <FlatList
                    data={keyData}
                    keyExtractor={(item) => item?._id}
                    renderItem={({ item }) => (
                        <KeysCard item={item} />
                    )}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading?.refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    contentContainerStyle={
                        keyData?.length > 0
                            ? styles.contentContainerStyle
                            : styles.emptyContainerStyle
                    }
                    ListEmptyComponent={<Nodata />}
                    ItemSeparatorComponent={<Seperator height={SIZES.height * 0.01} />}
                    onEndReached={handlePagination}
                    onEndReachedThreshold={0.1}
                />
            )}


            <AddButton
                title='Add'
                onPress={handleAddPress}
                mainStyle={{ position: 'absolute', bottom: 10, height: fontSize(50) }}
            />

        </MainView>
    )
}

export default RequestKeys

const styles = StyleSheet.create({
    mainStyle: {
        marginHorizontal: SIZES.width * 0.035,
    },
    contentContainerStyle: {
        paddingHorizontal: SIZES.width * 0.05,
        paddingTop: SIZES.height * 0.01,
        paddingBottom: SIZES.height * 0.1
    },
    emptyContainerStyle: {
        flex: 1,
    },
})