import { Alert, BackHandler, Platform } from 'react-native';
import JailMonkey from 'jail-monkey';

/**
 * SecurityService
 * Checks for developer mode, ADB, jailbreak/root, and other tampering.
 * If a threat is detected, optionally block the app.
 */
const SecurityService = {
    async checkDeviceSecurity({ blockOnDetect = true } = {}) {
        try {
            // Wrap each in Promise.resolve() so you can safely await if JailMonkey changes to async later
            const isJailBroken = await Promise.resolve(JailMonkey.isJailBroken()); // Rooted / Jailbroken
            const isDebuggedMode = await Promise.resolve(JailMonkey.isDebuggedMode()); // Debugger attached
            const isDevMode = await Promise.resolve(JailMonkey.isDevelopmentSettingsMode()); // Developer options enabled
            const isMockLocation =
                Platform.OS === 'android'
                    ? await Promise.resolve(JailMonkey.canMockLocation())
                    : false;
            const isHookDetected =
                Platform.OS === 'android'
                    ? await Promise.resolve(JailMonkey.hookDetected())
                    : false;

            // trustFall runs all major checks internally
            const trustFallDetected = await Promise.resolve(JailMonkey.trustFall());

            const threatDetected =
                isJailBroken ||
                isDebuggedMode ||
                isDevMode ||
                isMockLocation ||
                isHookDetected ||
                trustFallDetected;

            console.log('🔍 Security Check Results:');
            console.log({
                isJailBroken,
                isDebuggedMode,
                isDevMode,
                isMockLocation,
                isHookDetected,
                trustFallDetected,
            })

            return {
                isJailBroken,
                isDebuggedMode,
                isDevMode,
                isMockLocation,
                isHookDetected,
                trustFallDetected,
                threatDetected,
            };
        } catch (error) {
            console.warn('Security check failed:', error);
            return { error };
        }
    },
};

export default SecurityService;
