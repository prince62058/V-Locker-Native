import NetInfo from '@react-native-community/netinfo'

export const getNetworkStatus = async () => {
    const state = await NetInfo.fetch()
    return {
        isConnected: state.isConnected,
        type: state.type,
        details: state.details,
    }
}

export const subscribeNetworkChange = (callback) => {
    const unsubscribe = NetInfo.addEventListener((state) => {
        callback({
            isConnected: state.isConnected,
            type: state.type,
        })
    })
    return unsubscribe // call this to stop listening
}

export const isOnline = async () => {
    const { isConnected } = await NetInfo.fetch()
    return Boolean(isConnected)
}
