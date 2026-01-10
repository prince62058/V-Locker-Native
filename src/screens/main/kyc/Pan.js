import { useCallback, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'


import SubmitButton from '../../../components/common/button/SubmitButton'
import CustomHeader from '../../../components/header/CustomHeader'
import MainText from '../../../components/MainText'
import MainView from '../../../components/MainView'
import UploadInput from '../../../components/uploadInput'
import { FONTS, SIZES } from '../../../constants'
import { updatePanThunk } from '../../../redux/slices/main/kycSlice'
import { showToast } from '../../../utils/ToastAndroid'
import { fontSize } from '../../../utils/fontSize'
import CustomeInput from '../../../components/common/input/CustomeInput'


const Pan = ({ navigation, route }) => {


    const { customerId } = route.params


    const dispatch = useDispatch()
    const { loading } = useSelector(state => state.kyc)
    const { customerProfile } = useSelector(state => state.customer)
    // console.log(customerProfile)

    const initialData = {
        panNumber: customerProfile?.kyc?.pan?.number ?? "",
        panPhoto: customerProfile?.kyc?.pan?.photo ?? ""
    };
    const [form, setForm] = useState(initialData)
    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }


    const validate = () => {
        if (form.panNumber?.trim() === '') {
            showToast('Pan number is required')
            return false
        }
        if (form.panNumber?.length < 10) {
            showToast('Pan number should be 10 digits')
            return false
        }
        if (form.panPhoto === '') {
            showToast('Pan photo is required')
            return false
        }
        return true
    }
    const handleSubmit = async () => {
        if (!validate()) return

        const initialData = {
            panNumber: customerProfile?.kyc?.pan?.number ?? "",
            panPhoto: customerProfile?.kyc?.pan?.photo ?? ""
        };

        // Compare and include only updated fields
        const updatedFields = Object.entries(form).reduce((acc, [key, value]) => {
            const oldValue = initialData[key];
            if (String(value) !== String(oldValue)) {
                acc[key] = value;
            }
            return acc;
        }, {});

        if (Object.keys(updatedFields).length === 0) {
            showToast('No changes to update');
            return;
        }

        console.log('Updated Aadhar payload ---> ', updatedFields);


        const response = await dispatch(updatePanThunk({ data: updatedFields, customerId }))
        if (updatePanThunk.fulfilled.match(response)) {
            showToast('Pan detials saved succesfully')
            navigation.goBack()
        }
    }


    const onRefresh = useCallback(() => {
        setForm(initialData)
    }, [])


    return (
        <MainView transparent={false}>
            <CustomHeader back />
            <ScrollView
                contentContainerStyle={{ paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={false} />}
            >
                <View style={styles.mainStyle}>
                    <MainText style={{ fontFamily: FONTS.semiBold, fontSize: fontSize(18) }}>Complete PAN KYC</MainText>

                    <CustomeInput
                        required
                        label="Pan Nubmer"
                        placeholder="Enter your pan number"
                        value={form.panNumber}
                        onChangeText={text => handleChange('panNumber', text)}
                        maxLength={10}
                    />

                    <UploadInput
                        heading='Upload Pan Card'
                        msg='Make sure your Pan Card photo is clear and visible.'
                        onImageSelected={(imagePath) => {
                            handleChange('panPhoto', imagePath)
                        }}
                        value={form?.panPhoto}
                        onImageRemove={() => handleChange('panPhoto', "")}
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

export default Pan

const styles = StyleSheet.create({
    mainStyle: {
        marginHorizontal: SIZES.width * 0.035,
    },
    button: {
        marginHorizontal: 0
    }
})