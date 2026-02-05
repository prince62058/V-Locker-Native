import { Platform, ToastAndroid, Alert } from 'react-native';

export const showToast = message => {
  if (Platform.OS === 'android') {
    const msgToCheck =
      typeof message === 'string' ? message : 'Something went wrong';
    ToastAndroid.show(msgToCheck, ToastAndroid.SHORT);
  } else {
    const msgToCheck =
      typeof message === 'string' ? message : 'Something went wrong';
    Alert.alert('', msgToCheck); // Simple popup in iOS
  }
};

export const showToastWithGravity = message => {
  if (Platform.OS === 'android') {
    const msgToCheck =
      typeof message === 'string' ? message : 'Something went wrong';
    ToastAndroid.showWithGravity(
      msgToCheck,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
  } else {
    const msgToCheck =
      typeof message === 'string' ? message : 'Something went wrong';
    Alert.alert('', msgToCheck); // iOS fallback
  }
};

export const showToastWithGravityAndOffset = message => {
  if (Platform.OS === 'android') {
    const msgToCheck =
      typeof message === 'string' ? message : 'Something went wrong';
    ToastAndroid.showWithGravityAndOffset(
      msgToCheck,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  } else {
    const msgToCheck =
      typeof message === 'string' ? message : 'Something went wrong';
    Alert.alert('', msgToCheck);
  }
};
