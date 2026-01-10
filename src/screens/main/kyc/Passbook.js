import { useCallback, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import SubmitButton from '../../../components/common/button/SubmitButton'
import CustomHeader from '../../../components/header/CustomHeader'
import MainText from '../../../components/MainText'
import MainView from '../../../components/MainView'
import UploadInput from '../../../components/uploadInput'
import { FONTS, SIZES } from '../../../constants'
import { updatePassbookThunk } from '../../../redux/slices/main/kycSlice'
import { showToast } from '../../../utils/ToastAndroid'
import { fontSize } from '../../../utils/fontSize'

const Passbook = ({ navigation, route }) => {
    const { customerId } = route.params

    const dispatch = useDispatch()
    const { loading } = useSelector(state => state.kyc)
    const { customerProfile } = useSelector(state => state.customer)

    // Initial data
    const initialData = {
        bankPassbookPhoto: customerProfile?.kyc?.bankPassbook?.photo ?? ""
    }

    const [form, setForm] = useState(initialData)

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    const validate = () => {
        if (form.bankPassbookPhoto === '') {
            showToast('Bank passbook photo is required')
            return false
        }
        return true
    }

    const handleSubmit = async () => {
        if (!validate()) return

        // Compare and include only updated fields
        const updatedFields = Object.entries(form).reduce((acc, [key, value]) => {
            const oldValue = initialData[key]
            if (String(value) !== String(oldValue)) {
                acc[key] = value
            }
            return acc
        }, {})

        if (Object.keys(updatedFields).length === 0) {
            showToast('No changes to update')
            return
        }

        console.log('Updated Passbook payload ---> ', updatedFields)

        const response = await dispatch(updatePassbookThunk({ data: updatedFields, customerId }))
        if (updatePassbookThunk.fulfilled.match(response)) {
            showToast('Passbook details saved successfully')
            navigation.goBack()
        }
    }

    const onRefresh = useCallback(() => {
        setForm(initialData)
    }, [customerProfile])

    return (
        <MainView transparent={false}>
            <CustomHeader back />
            <ScrollView
                contentContainerStyle={{ paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={false} />}
            >
                <View style={styles.mainStyle}>
                    <MainText
                        style={{
                            fontFamily: FONTS.semiBold,
                            fontSize: fontSize(18)
                        }}
                    >
                        Customer Bank Passbook
                    </MainText>

                    <UploadInput
                        heading="Upload Bank Passbook"
                        msg="Make sure your Bank Passbook photo is clear and visible."
                        onImageSelected={(imagePath) =>
                            handleChange('bankPassbookPhoto', imagePath)
                        }
                        value={form?.bankPassbookPhoto}
                        onImageRemove={() => handleChange('bankPassbookPhoto', "")}
                    />

                    <SubmitButton
                        title="Submit"
                        onPress={handleSubmit}
                        mainStyle={styles.button}
                        loading={loading}
                    />
                </View>
            </ScrollView>
        </MainView>
    )
}

export default Passbook

const styles = StyleSheet.create({
    mainStyle: {
        marginHorizontal: SIZES.width * 0.035,
    },
    button: {
        marginHorizontal: 0
    }
})
