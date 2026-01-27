import { Alert, PermissionsAndroid } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { COLORS } from '../../constants';

/**
 * Opens the gallery picker and returns the selected image object.
 * @param {Object} [options] – (optional) customize picker (e.g. cropping, width, height)
 * @returns {Promise<Object>} – Promise resolving to the image object
 */

const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera to take photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

export async function pickImage() {
  try {
    const image = await ImagePicker.openPicker({
      cropping: true,
      freeStyleCropEnabled: true,
      compressImageQuality: 0.8,
      mediaType: 'photo',
      cropperToolbarTitle: 'Resize photo',
      cropperActiveWidgetColor: COLORS.primary,
      cropperStatusBarColor: COLORS.black,
    });

    let path = image.path;
    if (
      Platform.OS === 'android' &&
      !path.startsWith('file://') &&
      !path.startsWith('content://')
    ) {
      path = `file://${path}`;
    }

    return {
      name: image.filename || `image_${Date.now()}.jpg`,
      type: image.mime || 'image/jpeg',
      uri: path,
    };
  } catch (error) {
    console.log('Image picker error', error);
    return null;
  }
}

export async function captureImage() {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera access is required to take photos.',
      );
      return null;
    }

    const image = await ImagePicker.openCamera({
      cropping: true,
      cropperCircleOverlay: false,
      compressImageQuality: 0.8,
      freeStyleCropEnabled: true,
      includeBase64: false,
      mediaType: 'photo',
      useFrontCamera: false,
    });

    let path = image.path;
    if (
      Platform.OS === 'android' &&
      !path.startsWith('file://') &&
      !path.startsWith('content://')
    ) {
      path = `file://${path}`;
    }

    return {
      name: image.filename || `capture_${Date.now()}.jpg`,
      type: image.mime || 'image/jpeg',
      uri: path,
    };
  } catch (error) {
    // handle error or return null
    return null;
  }
}
