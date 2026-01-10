import { Platform } from 'react-native'
import SpInAppUpdates, { IAUUpdateKind } from 'sp-react-native-in-app-updates'

export const checkAppUpdate = (appCond) => {
    const inAppUpdates = new SpInAppUpdates(true)
    inAppUpdates.checkNeedsUpdate()
        .then((result) => {
            if (result?.shouldUpdate) {
                let updateOptions = {}
                if (Platform.OS === 'android') {
                    updateOptions = {
                        updateType: appCond === "FORCED" ? IAUUpdateKind.IMMEDIATE : IAUUpdateKind.FLEXIBLE,
                    }
                } else {
                    updateOptions = {
                        updateType: appCond === "FORCED" ? IAUUpdateKind.IMMEDIATE : IAUUpdateKind.FLEXIBLE,
                    }
                }
                inAppUpdates.startUpdate(updateOptions)
            }
        })
        .catch(() => { })
}
