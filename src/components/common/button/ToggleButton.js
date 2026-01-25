import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants';

const ToggleButton = ({
    value = false,
    onPress = () => { },
    activeColor = COLORS.primary,
    inactiveColor = '#686868',
    circleColor = '#fff',
    size = 25,
}) => {

    const animated = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animated, {
            toValue: value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [value]);

    const containerWidth = size * 1.8;

    const circleSize = size * 0.8;

    const translateX = animated.interpolate({
        inputRange: [0, 1],
        outputRange: [2, circleSize - 2], // fixed here
    });

    const backgroundColor = animated.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveColor, activeColor],
    });

    return (
        <Pressable onPress={onPress} style={{ width: containerWidth }}>
            <Animated.View
                style={[
                    styles.container,
                    { width: containerWidth, height: size, backgroundColor }
                ]}
            >
                <Animated.View
                    style={[
                        styles.circle,
                        {
                            width: circleSize,
                            height: circleSize,
                            backgroundColor: circleColor,
                            transform: [{ translateX }],
                        },
                    ]}
                />
            </Animated.View>
        </Pressable>

    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 50,
        padding: 2,
        justifyContent: 'center',
    },
    circle: {
        borderRadius: 50,
    },
});

export default ToggleButton;
