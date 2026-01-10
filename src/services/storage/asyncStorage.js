import AsyncStorage from '@react-native-async-storage/async-storage';

export const setItem = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
        console.error('Error setting item in AsyncStorage:', error);
    }
};

export const getItem = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue !== null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error('Error getting item from AsyncStorage:', error);
        return null;
    }
};

export const deleteItem = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing item from AsyncStorage:', error);
    }
};
