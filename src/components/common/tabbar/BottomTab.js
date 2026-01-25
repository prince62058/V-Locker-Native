import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { COLORS, SIZES } from '../../../constants';
import { fontSize } from '../../../utils/fontSize';

const { width } = Dimensions.get('window');

const TabItem = ({
  isFocused,
  options,
  onPress,
  onLongPress,
  iconName,
  tabWidth,
  label,
}) => {
  const animatedValue = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    animatedValue.value = withSpring(isFocused ? 1 : 0, {
      damping: 25,
      stiffness: 400,
    });
  }, [isFocused]);

  const floatingButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: -25 * animatedValue.value }, // Move up
        { scale: 0.5 + 0.5 * animatedValue.value }, // Scale from 0.5 to 1
      ],
      opacity: animatedValue.value,
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - animatedValue.value,
      transform: [{ scale: 1 - 0.5 * animatedValue.value }],
    };
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.tabButton, { width: tabWidth }]}
      activeOpacity={1}
    >
      <View style={styles.iconContainer}>
        {/* Unfocused Icon */}
        <Animated.View style={[styles.unfocusedIcon, iconStyle]}>
          <Ionicons
            name={iconName}
            size={fontSize(24)}
            color={'rgba(255,255,255,0.6)'}
          />
        </Animated.View>

        {/* Focused Floating Button */}
        <Animated.View style={[styles.floatingButton, floatingButtonStyle]}>
          <Ionicons name={iconName} size={fontSize(28)} color={COLORS.white} />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const BottomTab = ({ state, descriptors, navigation }) => {
  const totalTabs = state.routes.length;
  const tabWidth = width / totalTabs;
  const height = SIZES.height * 0.08;
  const curveWidth = 80;
  const curveDepth = 35;
  const activeIndex = state.index;

  const getPath = () => {
    const center = tabWidth * activeIndex + tabWidth / 2;
    const left = center - curveWidth / 2;
    const right = center + curveWidth / 2;

    return `
      M 0 0
      L ${left} 0
      C ${left + curveWidth * 0.25} 0, ${
      center - curveWidth * 0.25
    } ${curveDepth}, ${center} ${curveDepth}
      C ${center + curveWidth * 0.25} ${curveDepth}, ${
      right - curveWidth * 0.25
    } 0, ${right} 0
      L ${width} 0
      L ${width} ${height}
      L 0 ${height}
      Z
    `;
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* SVG Background */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width={width} height={height}>
          <Path d={getPath()} fill={COLORS.black} />
        </Svg>
      </View>

      {/* Tabs */}
      <View style={styles.contentContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const iconName =
            {
              Home: 'home',
              Dashboard: 'home',
              AddCustomer: 'person-add',
              Notification: 'notifications',
              Profile: 'person',
            }[route.name] || 'home';

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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              options={options}
              onPress={onPress}
              onLongPress={onLongPress}
              iconName={iconName}
              tabWidth={tabWidth}
              label={route.name}
            />
          );
        })}
      </View>
    </View>
  );
};

export default BottomTab;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    borderTopWidth: 0,
  },
  contentContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  unfocusedIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  floatingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    // Shadow for depth
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
