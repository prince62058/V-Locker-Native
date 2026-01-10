import { Alert, PermissionsAndroid } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import { COLORS } from '../../constants'

/**
 * Opens the gallery picker and returns the selected image object.
 * @param {Object} [options] – (optional) customize picker (e.g. cropping, width, height)
 * @returns {Promise<Object>} – Promise resolving to the image object
 */


const requestCameraPermission = async () => {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
    return granted === PermissionsAndroid.RESULTS.GRANTED
}


export async function pickImage() {
    try {
        const image = await ImagePicker.openPicker({
            cropping: true,
            freeStyleCropEnabled: true,
            compressImageQuality: 1,
            cropperToolbarTitle: 'Resize photo',
            cropperActiveWidgetColor: COLORS.primary,
            cropperStatusBarColor: COLORS.black,
        })
        // console.log({ name: image.filename, type: image.mime, uri: image.path })
        return { name: image.filename, type: image.mime, uri: image.path }
    } catch (error) {
        console.log('Image picker error', error)
        return null
    }
}

/**
 * Opens the camera and returns the captured image object.
 * @param {Object} [options] – (optional) customize camera (e.g. cropping, width, height)
 * @returns {Promise<Object>} – Promise resolving to the image object
 */
export async function captureImage() {
    try {
        const hasPermission = await requestCameraPermission()
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera access is required to take photos.')
            return null
        }

        const image = await ImagePicker.openCamera({
            cropping: true,
            cropperCircleOverlay: false,
            compressImageQuality: 0.9,
            freeStyleCropEnabled: true,
            includeBase64: false,
            mediaType: 'photo',
            useFrontCamera: false,
            cameraType: 'front',
        })

        return { name: image.filename, type: image.mime, uri: image.path }
    } catch (error) {
        // handle error or return null
        return null
    }
}
