import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { COLORS, FONTS, icons, SIZES } from '../../constants';
import { fontSize } from '../../utils/fontSize';
import MainText from '../MainText';
import { pickImage } from '../../services/picker/cropImagePicker';

const UploadInput = ({
  heading = 'Upload File',
  msg = 'Supported formats: JPG, PNG',
  onImageSelected,
  value,
  onImageRemove,
}) => {
  const openGallery = async () => {
    try {
      const result = await pickImage();
      if (onImageSelected) onImageSelected(result);
    } catch (error) {
      console.log('Image selection canceled or error:', error);
    }
  };

  const handleClearImage = () => {
    onImageRemove();
  };

  return (
    <View style={{ marginVertical: SIZES.height * 0.015 }}>
      <MainText style={{ marginBottom: SIZES.height * 0.01 }}>
        {heading}
      </MainText>

      <Pressable style={styles.inputContainer} onPress={openGallery}>
        {value ? (
          <>
            <Image
              source={{ uri: value?.uri || value }}
              style={styles.selectedImage}
              resizeMode="contain"
            />
            <Pressable style={styles.cancelButton} onPress={handleClearImage}>
              <MainText style={styles.cancelText}>X</MainText>
            </Pressable>
          </>
        ) : (
          <View style={styles.uploadView}>
            <Image source={icons.upload} style={styles.uploadIcon} />
            <MainText style={styles.uploadText}>Upload</MainText>
          </View>
        )}
      </Pressable>

      <MainText style={styles.msgText}>{msg}</MainText>
    </View>
  );
};

export default UploadInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: SIZES.width * 0.04,
    height: SIZES.height * 0.225,
    width: SIZES.width * 0.9,
    // marginVertical: SIZES.height * 0.01,
  },
  selectedImage: {
    flex: 1,
    height: '90%',
    resizeMode: 'cover',
  },
  uploadView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.height * 0.01,
    paddingHorizontal: SIZES.width * 0.025,
    backgroundColor: COLORS.border,
    borderRadius: 20,
    marginLeft: SIZES.width * 0.02,
  },
  uploadIcon: {
    width: SIZES.width * 0.05,
    height: SIZES.width * 0.05,
    resizeMode: 'contain',
    marginRight: SIZES.width * 0.01,
  },
  uploadText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: fontSize(),
  },
  msgText: {
    color: COLORS.borderLight,
    fontFamily: FONTS.regular,
    fontSize: fontSize(12),
    marginTop: SIZES.height * 0.01,
  },
  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: SIZES.width * 0.02,
    paddingVertical: SIZES.width * 0.0065,
    backgroundColor: COLORS.border,
    borderRadius: 30,
  },
  cancelText: {
    // marginBottom: SIZES.height * 0.002,
    fontSize: fontSize(12),
  },
});
