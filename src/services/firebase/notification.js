import { getApp } from '@react-native-firebase/app'
import {
    getInitialNotification,
    getMessaging,
    getToken,
    onMessage,
    onNotificationOpenedApp,
    setBackgroundMessageHandler
} from '@react-native-firebase/messaging'
import { createNotification } from '../notifee/notifee'
import notificationPermission from '../permissions/notificationPermission'

const app = getApp()
const messagingInstance = getMessaging(app)

export async function getFcmToken() {
    try {
        const hasPermission = await notificationPermission()
        if (!hasPermission) return null
        return await getToken(messagingInstance)
    } catch {
        return null
    }
}

export const foregroundMessage = () => {
    onMessage(messagingInstance, async (message) => {
        console.log('Foreground Message', message)
        if (message) {
            await createNotification(message)
        }
    })
}

export const backgroundMessageHandler = () => {
    setBackgroundMessageHandler(messagingInstance, async (message) => {
        console.log('Background Message', message)
        if (message?.messageId) {
            await createNotification(message)
        }
    })
}

export const onNotificationOpened = () => {
    onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
        console.log('Notification opened from background:', remoteMessage)
    })
}

export const onAppLaunchedFromQuit = async () => {
    const remoteMessage = await getInitialNotification(messagingInstance)
    console.log('Notification onAppOpenedFromQuit:', remoteMessage)
}