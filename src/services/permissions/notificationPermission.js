import { Platform } from 'react-native'
import { checkNotifications, requestNotifications, RESULTS } from 'react-native-permissions'

const notificationPermission = async () => {
    try {

        // Android 13+ requires POST_NOTIFICATIONS runtime permission
        if (Platform.OS === 'android') {

            if (Platform.Version >= 33) {
                const { status: currentStatus } = await checkNotifications();
                // console.log('Notification permission status:', currentStatus);

                if (currentStatus === RESULTS.GRANTED) return true;
                if (currentStatus === RESULTS.BLOCKED || currentStatus === RESULTS.UNAVAILABLE) return false;

                // Request permission if not yet granteda
                const { status: newStatus } = await requestNotifications(['alert', 'sound', 'badge']);
                return newStatus === RESULTS.GRANTED;
            }

            // Android < 13: notifications are granted by default
            return true;
        }

        // iOS: use the notifications API
        const { status: iosStatus } = await checkNotifications();
        console.log('iOS notification permission status:', iosStatus);
        if (iosStatus === RESULTS.GRANTED) return true;
        if (iosStatus === RESULTS.BLOCKED || iosStatus === RESULTS.UNAVAILABLE) return false;

        const { status: requestedIos } = await requestNotifications(['alert', 'sound']);
        console.log('iOS requested permission status:', requestedIos);
        return requestedIos === RESULTS.GRANTED;
    } catch (error) {
        console.warn('Notification permission error:', error);
        return false;
    }
};

export default notificationPermission;