// components/HideableView.js
import React, { useRef, useEffect, useState } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const HideableView = ({ visible, children, duration = 200, style,height }) => {
  const [contentHeight, setContentHeight] = useState(0);
  const animatedValue = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: visible ? 1 : 0,
      duration,
      useNativeDriver: false, // ❌ important for height animation
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: animatedValue,
          maxHeight: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, height], // 0 -> hidden, actual height -> visible
          }),
          overflow: 'hidden', // prevent content overflow when hidden
        },
      ]}
      onLayout={(e) => {
        if (contentHeight === 0) {
          setContentHeight(e.nativeEvent.layout.height);
        }
      }}
    >
      {children}
    </Animated.View>
  );
};

export default HideableView;
