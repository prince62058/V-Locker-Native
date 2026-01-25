import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Base screen sizes (iPhone X)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scales a size based on the screen width.
 * Useful for width, marginHorizontal, paddingHorizontal.
 */
export const scale = size => (width / guidelineBaseWidth) * size;

/**
 * Scales a size based on the screen height.
 * Useful for height, marginVertical, paddingVertical.
 */
export const verticalScale = size => (height / guidelineBaseHeight) * size;

/**
 * Scales a size with a moderation factor.
 * Useful for font sizes, border radius, icons, or when 'scale' is too aggressive.
 * factor: 0.5 is default. 0 means no scaling (original size), 1 means full scaling.
 */
export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/**
 * Helper specifically for font sizes to ensure they align to pixel grid.
 */
export const fontSize = size =>
  Math.round(PixelRatio.roundToNearestPixel(moderateScale(size)));
