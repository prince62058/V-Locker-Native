import DeviceInfo from 'react-native-device-info';

export async function getDeviceData() {
    try {
        const [
            batteryLevel,
            isCharging,
            powerState,
            isEmulator,
            isTablet,
            hasNotch,
            deviceName,
            manufacturer,
            model,
            totalMemory,
            freeDiskStorage,
            apiLevel,
        ] = await Promise.all([
            DeviceInfo.getBatteryLevel(),
            DeviceInfo.isBatteryCharging(),
            DeviceInfo.getPowerState(),
            DeviceInfo.isEmulator(),
            DeviceInfo.isTablet(),
            DeviceInfo.hasNotch(),
            DeviceInfo.getDeviceName(),
            DeviceInfo.getManufacturer(),
            Promise.resolve(DeviceInfo.getModel()), // sync call wrapped
            DeviceInfo.getTotalMemory(),
            DeviceInfo.getFreeDiskStorage(),
            DeviceInfo.getApiLevel ? DeviceInfo.getApiLevel() : Promise.resolve(null),
        ]);

        const deviceData = {
            deviceId: DeviceInfo.getDeviceId(),
            brand: DeviceInfo.getBrand(),
            systemName: DeviceInfo.getSystemName(),
            systemVersion: DeviceInfo.getSystemVersion(),
            uniqueId: await DeviceInfo.getUniqueId(),
            appVersion: DeviceInfo.getVersion(),
            buildNumber: DeviceInfo.getBuildNumber(),

            batteryLevel,
            isCharging,
            powerState,
            isEmulator,
            isTablet,
            hasNotch,
            deviceName,
            manufacturer,
            model,
            totalMemory,
            freeDiskStorage,
            apiLevel,
        };

        console.log('DEVICE INFO --->', deviceData);
        return deviceData;
    } catch (error) {
        console.error("Error getting device info:", error);
        return {};
    }
}
