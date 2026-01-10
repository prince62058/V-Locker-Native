import React from 'react';
import { View, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { COLORS, SIZES } from '../../../constants';
import { fontSize } from '../../../utils/fontSize';

const CIRCLE_SIZE = 48; // floating circle diameter

export default function BottomTab({ state, descriptors, navigation }) {
    const tabCount = state.routes.length;
    const windowWidth = Dimensions.get('window').width;
    const tabWidth = windowWidth / tabCount;
    const offsetX = (tabWidth - CIRCLE_SIZE) / 2;

    return (
        <View style={styles.container}>
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;

                const iconName = {
                    Home: isFocused ? 'home' : 'home-outline',
                    AddCustomer: isFocused ? 'person-add' : 'person-add-outline',
                    Notification: isFocused ? 'notifications' : 'notifications-outline',
                    Profile: isFocused ? 'person' : 'person-outline',
                }[route.name];

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <View key={route.key} style={[styles.tabButton, { width: tabWidth }]}>
                        <Pressable
                            onPress={onPress}
                            android_ripple={{ color: 'rgba(255,255,255,0.12)', borderless: false }}
                            style={styles.pressable}
                        >
                            {/* Floating circle behind the icon when focused */}
                            {isFocused && (
                                <View
                                    style={[
                                        styles.floatingCircle,
                                        {
                                            backgroundColor: COLORS.primary,
                                        },
                                    ]}
                                />
                            )}

                            {/* Icon always centered */}
                            <Ionicons
                                name={iconName}
                                size={isFocused ? fontSize(26) : fontSize(25)}
                                color={isFocused ? COLORS.white : 'rgba(255,255,255,0.85)'}
                                style={styles.icon}
                            />
                        </Pressable>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flexDirection: 'row',
        backgroundColor: COLORS.black,
        height: SIZES.height * 0.08,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 0,
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    pressable: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingCircle: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: COLORS.primary,
        // shadows
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
        zIndex: 0,
    },
    icon: {
        zIndex: 1,
        elevation: Platform.OS === 'android' ? 10 : 0,
    },
});
