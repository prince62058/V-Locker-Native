import { Platform, ToastAndroid, Alert } from "react-native";

export const showToast = (message) => {
    if (Platform.OS === "android") {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
        Alert.alert("", message); // Simple popup in iOS
    }
};

export const showToastWithGravity = (message) => {
    if (Platform.OS === "android") {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
        );
    } else {
        Alert.alert("", message); // iOS fallback
    }
};

export const showToastWithGravityAndOffset = (message) => {
    if (Platform.OS === "android") {
        ToastAndroid.showWithGravityAndOffset(
            message,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
        );
    } else {
        Alert.alert("", message);
    }
};
