import { useCallback, useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import MainView from '../../../components/MainView'
import BankCard from '../../../components/card/BankCard'
import AddButton from '../../../components/common/button/AddButton'
import Loader from '../../../components/common/loader/Loader'
import Nodata from '../../../components/common/nodata/Nodata'
import Seperator from '../../../components/common/seperator/Seperator'
import CustomHeader from '../../../components/header/CustomHeader'
import { SIZES } from '../../../constants'
import { deleteBankThunk, getBankThunk } from '../../../redux/slices/main/bankSlice'
import ConfirmModal from '../../../components/common/modal/ConfirmModal'


const BankList = ({ navigation }) => {

    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const { bankData, loading, refreshing, deleting } = useSelector(state => state.bank)
    // console.log('bank data', bankData, loading, refreshing)


    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [modal, setModal] = useState({ delete: false })
    const handleModal = (key, value) => {
        setModal(prev => ({ ...prev, [key]: value }))
    }


    const fetchData = ({ isRefresh = false }) => {
        dispatch(getBankThunk({ isRefresh }))
    }

    useEffect(() => {
        fetchData({})
    }, [])

    const onRefresh = useCallback(() => {
        fetchData({ isRefresh: true })
    }, [])


    const handleAddPress = () => {
        navigation.navigate('AddBank')
    }

    const handleBankPress = (item) => {
        navigation.navigate('EditBank', item)
    }
    const handleDeletePress = (item) => {
        if (deleting) return
        setSelectedCustomer(item)
        handleModal('delete', true)
    }

    const handleCustomerDelete = async () => {
        if (selectedCustomer?._id) {
            await dispatch(deleteBankThunk({ bankId: selectedCustomer._id }))
            handleModal('delete', false)
            setSelectedCustomer(null)
        }
    }

    useEffect(() => {
        console.log(selectedCustomer)
    }, [selectedCustomer])


    return (
        <MainView transparent={false}>
            <CustomHeader title='Bank Details' back />

            <AddButton title='Add Bank' onPress={handleAddPress} />
            <Seperator height={SIZES.height * 0.02} />

            {(loading && bankData?.data?.length <= 0)
                ?
                <Loader />
                :
                <FlatList
                    data={bankData?.data}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => <BankCard
                        item={item}
                        onPress={() => handleBankPress(item)}
                        onDelete={() => handleDeletePress(item)}
                    />}
                    contentContainerStyle={bankData?.data.length > 0 ? styles.contentContainerStyle : styles.emptyContainerStyle}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ItemSeparatorComponent={<Seperator />}
                    ListEmptyComponent={<Nodata />}
                />
            }


            <ConfirmModal
                visible={modal.delete}
                onClose={() => {
                    handleModal('delete', false)
                    setSelectedCustomer(null)
                }}
                onConfirm={handleCustomerDelete} // ✅ uses selectedCustomer from state
                title="Delete Bank"
                desc={`Are you sure you want to delete ${selectedCustomer?.bankName || 'this customer'} ? This action cannot be undone.`}
                confirmText={'Delete'}
            />

        </MainView>
    )
}

export default BankList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: SIZES.width * 0.05
    },
    contentContainerStyle: {
        paddingHorizontal: SIZES.width * 0.05
    },
    emptyContainerStyle: {
        flex: 1
    }

})