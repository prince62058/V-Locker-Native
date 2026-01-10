// DebugStatusModal.js
import React, { useMemo, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    BackHandler,
    Pressable,
} from 'react-native';

// RN 0.73+ exposes NativeDevSettings to manually toggle Remote JS Debugging
let NativeDevSettings;
try {
    // Avoid crashing on versions where it doesn't exist
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    NativeDevSettings = require('react-native/Libraries/NativeModules/specs/NativeDevSettings').default;
} catch (e) {
    NativeDevSettings = undefined;
}

const canToggleRemoteDebug =
    NativeDevSettings &&
    (typeof NativeDevSettings.setIsDebuggingRemotely === 'function' ||
        typeof NativeDevSettings.setIsDebuggingNewJS === 'function');

export default function DebugStatusModal({
    visible = false,
    onRequestClose = () => { },
}) {
    const isDebug = __DEV__; // True in debug JS runtime, false in release [web:29]

    const disableDebugging = useCallback(() => {
        // RN 0.73+: Remote JS Debugging moved out of Dev Menu; must call NativeDevSettings in DEV [web:9][web:29]
        if (canToggleRemoteDebug) {
            try {
                if (typeof NativeDevSettings.setIsDebuggingRemotely === 'function') {
                    NativeDevSettings.setIsDebuggingRemotely(false);
                }
                if (typeof NativeDevSettings.setIsDebuggingNewJS === 'function') {
                    NativeDevSettings.setIsDebuggingNewJS(false);
                }
            } catch {
                // ignore if not supported
            }
        }
    }, []);

    const exitApp = useCallback(() => {
        // Programmatic app exit is Android-only via BackHandler.exitApp() [web:2]
        if (Platform.OS === 'android') {
            BackHandler.exitApp();
        }
    }, []);

    const subtitle = useMemo(() => {
        return isDebug
            ? 'Debug build detected. Performance may be affected by dev tooling.'
            : 'Release build detected. Debug tooling is disabled.';
    }, [isDebug]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        // onRequestClose={onRequestClose} // Android back button closes modal [web:21]
        >
            <View style={styles.backdrop}>
                <Pressable style={styles.dismissArea} />
                <View style={styles.card}>
                    <View style={[styles.badge, isDebug ? styles.badgeOn : styles.badgeOff]}>
                        <Text style={styles.badgeText}>{isDebug ? 'DEBUG ON' : 'DEBUG OFF'}</Text>
                    </View>

                    <Text style={styles.title}>Runtime Mode</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    {isDebug && (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>
                                Remote JavaScript Debugging is deprecated from the Dev Menu in RN 0.73; toggle via NativeDevSettings when needed.
                            </Text>
                        </View>
                    )}

                    <View style={styles.actions}>
                        {isDebug && (
                            <TouchableOpacity
                                style={[styles.button, styles.buttonPrimary]}
                                onPress={disableDebugging}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.buttonText}>Turn Off Debugging</Text>
                            </TouchableOpacity>
                        )}

                        {Platform.OS === 'android' && (
                            <TouchableOpacity
                                style={[styles.button, styles.buttonDanger]}
                                onPress={exitApp}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.buttonText}>Exit App</Text>
                            </TouchableOpacity>
                        )}

                        {/* <TouchableOpacity
                            style={[styles.button, styles.buttonGhost]}
                            onPress={onRequestClose}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.buttonGhostText}>Close</Text>
                        </TouchableOpacity> */}
                    </View>

                    <Text style={styles.footerText}>
                        iOS cannot exit programmatically; close from the app switcher.
                    </Text>
                </View>
                <View pointerEvents="none" style={styles.aura} />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(6, 10, 20, 0.6)', // dimmed overlay
        alignItems: 'center',
        justifyContent: 'center',
    },
    dismissArea: {
        position: 'absolute',
        inset: 0,
    },
    card: {
        width: '88%',
        borderRadius: 20,
        paddingVertical: 22,
        paddingHorizontal: 18,
        backgroundColor: 'rgba(255,255,255,0.06)', // glassmorphism panel
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        marginBottom: 12,
    },
    badgeOn: {
        backgroundColor: 'rgba(48, 209, 88, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(48, 209, 88, 0.6)',
    },
    badgeOff: {
        backgroundColor: 'rgba(255, 69, 58, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 69, 58, 0.6)',
    },
    badgeText: {
        color: '#E6EAF2',
        letterSpacing: 1,
        fontWeight: '600',
        fontSize: 12,
    },
    title: {
        color: '#E6EAF2',
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 6,
        textAlign: 'left',
    },
    subtitle: {
        color: 'rgba(230,234,242,0.8)',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 14,
    },
    infoBox: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: 12,
        marginBottom: 16,
    },
    infoText: {
        color: 'rgba(230,234,242,0.85)',
        fontSize: 13,
        lineHeight: 18,
    },
    actions: {
        gap: 12,
        marginTop: 6,
    },
    button: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#6B6BFF', // gradient-like solid
    },
    buttonDanger: {
        backgroundColor: '#FF5E57',
    },
    buttonText: {
        color: '#0B0F1A',
        fontWeight: '700',
        fontSize: 15,
    },
    buttonGhost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(230,234,242,0.25)',
    },
    buttonGhostText: {
        color: '#E6EAF2',
        fontWeight: '700',
        fontSize: 15,
    },
    footerText: {
        marginTop: 10,
        color: 'rgba(230,234,242,0.6)',
        fontSize: 12,
        textAlign: 'center',
    },
    aura: {
        position: 'absolute',
        width: 340,
        height: 340,
        borderRadius: 999,
        backgroundColor: '#6B6BFF',
        opacity: 0.18,
        bottom: '20%',
        shadowColor: '#6B6BFF',
        shadowOpacity: 0.26,
        shadowRadius: 70,
        shadowOffset: { width: 0, height: 0 },
    },
});
