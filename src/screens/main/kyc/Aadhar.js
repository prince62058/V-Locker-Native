import { useCallback, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'


import SubmitButton from '../../../components/common/button/SubmitButton'
import CustomHeader from '../../../components/header/CustomHeader'
import MainText from '../../../components/MainText'
import MainView from '../../../components/MainView'
import UploadInput from '../../../components/uploadInput'
import { COLORS, FONTS, SIZES } from '../../../constants'
import { updateAadharThunk } from '../../../redux/slices/main/kycSlice'
import { fontSize } from '../../../utils/fontSize'
import { showToast } from '../../../utils/ToastAndroid'
import CustomeInput from '../../../components/common/input/CustomeInput'


const Aadhar = ({ navigation, route }) => {


    const { customerId } = route.params


    const dispatch = useDispatch()
    const { loading } = useSelector(state => state.kyc)
    const { customerProfile } = useSelector(state => state.customer)
    // console.log(customerProfile)


    const initialData = {
        aadhaarNumber: customerProfile?.kyc?.aadhaar?.number ?? "",
        aadhaarFront: customerProfile?.kyc?.aadhaar?.frontPhoto ?? "",
        aadhaarBack: customerProfile?.kyc?.aadhaar?.backPhoto ?? ""
    };
    const [form, setForm] = useState(initialData)
    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }


    const validate = () => {
        if (form.aadhaarNumber?.trim() === '') {
            showToast('Aadhar number is required')
            return false
        }
        if (form.aadhaarNumber?.length < 12) {
            showToast('Aadhar number should be 12 digit')
            return false
        }
        if (form.aadhaarFront === '' || form.aadhaarFront === null) {
            showToast('Aadhar front is required')
            return false
        }
        if (form.aadhaarBack === '' || form.aadhaarBack === null) {
            showToast('Aadhar back is required')
            return false
        }
        return true
    }
    const handleSubmit = async () => {
        if (!validate()) return;

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

        const response = await dispatch(updateAadharThunk({ data: updatedFields, customerId }));
        if (updateAadharThunk.fulfilled.match(response)) {
            showToast('Aadhaar details saved successfully');
            navigation.goBack();
        }
    };



    const onRefresh = useCallback(() => {
        setForm(initialData)
    }, [])


    return (
        <MainView transparent={false}>
            <CustomHeader title='' back />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={false} />}
            >
                <View style={styles.mainStyle}>
                    <MainText style={{ fontFamily: FONTS.semiBold, fontSize: fontSize(18) }}>Upload Your Complete Aadhaar KYC</MainText>

                    <CustomeInput
                        required
                        label="Aadhaar Nubmer"
                        placeholder="Enter your aadhaar number"
                        value={form.aadhaarNumber}
                        onChangeText={text => handleChange('aadhaarNumber', text)}
                        maxLength={12}
                        mobile
                    />

                    <UploadInput
                        heading='Upload Photo of Aadhar Card (Front)'
                        msg='Make sure your Front Aadhar card photo are clear and visible.'
                        onImageSelected={(imagePath) => {
                            handleChange('aadhaarFront', imagePath)
                        }}
                        value={form?.aadhaarFront}
                        onImageRemove={() => handleChange('aadhaarFront', "")}
                    />
                    <UploadInput
                        heading='Upload Photo of Aadhar Card (Back)'
                        msg='Make sure your Back Aadhar card photo are clear and visible.'
                        onImageSelected={(imagePath) => {
                            handleChange('aadhaarBack', imagePath)
                        }}
                        value={form?.aadhaarBack}
                        onImageRemove={() => handleChange('aadhaarBack', "")}
                    />
                    <View style={styles.box}>
                        <MainText>Customer Verify with Digilocker</MainText>
                        <MainText style={styles.smallText}>Customer verification with DigiLocker is a digital process to securely share verified identity documents with consent.</MainText>
                        <Pressable style={{ backgroundColor: COLORS.primary, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10, width: SIZES.width * 0.41 }}>
                            <MainText>Verify with Digilocker</MainText>
                        </Pressable>
                    </View>
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

export default Aadhar

const styles = StyleSheet.create({
    mainStyle: {
        marginHorizontal: SIZES.width * 0.04,
    },
    box: {
        width: SIZES.width * 0.9,
        borderRadius: SIZES.h4,
        borderWidth: 1,
        borderColor: '#C8C5F4',
        paddingHorizontal: SIZES.width * 0.04,
        paddingVertical: SIZES.height * 0.0125,
        marginVertical: SIZES.height * 0.02,
    },
    smallText: {
        fontSize: fontSize(16),
        fontFamily: FONTS.bold,
        color: '#B9B9B9',
        letterSpacing: 0.1,
        marginVertical: SIZES.h5,
    },
    button: {
        marginHorizontal: 0
    }
})