import { Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import MainView from '../../../components/MainView'
import CustomHeader from '../../../components/header/CustomHeader'
import { images, SIZES } from '../../../constants'
import Input from '../../../components/common/input/Input'
import { createKeyRecordThunk } from '../../../redux/slices/main/keySlice'
import { showToast } from '../../../utils/ToastAndroid'
import { useDispatch, useSelector } from 'react-redux'
import SubmitButton from '../../../components/common/button/SubmitButton'
import MainText from '../../../components/MainText'
import CustomeInput from '../../../components/common/input/CustomeInput'

const AddKeys = ({ navigation }) => {

    const dispatch = useDispatch()
    const { keyData, loading, pagination } = useSelector(state => state.keys)

    const initialData = {
        requestKeys: '',
    }
    const [form, setForm] = useState(initialData)
    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }))
        if (value?.length > 0) handleErrorChange(key, null)
    }

    const [errors, setError] = useState({})
    const handleErrorChange = (key, value) => {
        setError(prev => ({ ...prev, [key]: value }))
    }


    const validate = () => {
        if (form.requestKeys.trim() === '') {
            showToast('Keys is required')
            return false
        }
        return true
    }

    const handleCreatePress = async () => {
        if (!validate()) return;
        console.log('Keys payload data ---> ', form)

        const response = await dispatch(createKeyRecordThunk({ data: form }));
        if (createKeyRecordThunk.fulfilled.match(response)) {
            showToast('Key request submitted')
            navigation.goBack()
        }
    }


    const [keyboardOffset, setKeyboardOffset] = useState(0)
    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardOffset(Platform.OS === 'android' ? 0 : 90)
        })
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardOffset(-40)
        })
        return () => {
            showSub.remove()
            hideSub.remove()
        }
    }, [])


    return (
        <MainView transparent={false}>
            <CustomHeader title='Request Keys' back />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'android' ? 'height' : 'padding'}
                keyboardVerticalOffset={keyboardOffset}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
                    <View style={styles.container}>
                        <CustomeInput
                            placeholder='Enter keys number'
                            value={form.requestKeys}
                            onChangeText={(value) => handleChange('requestKeys', value)}
                            maxLength={10}
                            keyboardAppearance={'dark'}
                            mobile
                        />
                    </View>
                    <SubmitButton
                        title='Request Keys'
                        onPress={handleCreatePress}
                        mainStyle={styles.button}
                        loading={loading?.loading}
                    />
                </ScrollView>


            </KeyboardAvoidingView>

        </MainView>
    )
}

export default AddKeys

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: SIZES.width * 0.05
    },
    button: {
        marginBottom: SIZES.height * 0.01,
        marginHorizontal: 'auto',
    }
})