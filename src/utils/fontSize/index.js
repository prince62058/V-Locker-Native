import { Dimensions, PixelRatio } from "react-native"

const { width, height } = Dimensions.get("window")

// Base screen sizes (you can change according to your design mockup)
const guidelineBaseWidth = 375   // iPhone X width
const guidelineBaseHeight = 812  // iPhone X height

// Horizontal scale (based on width)
export const scale = size => (width / guidelineBaseWidth) * size

// Vertical scale (based on height)
export const verticalScale = size => (height / guidelineBaseHeight) * size

// Balanced scale (adjusts based on width but moderated)
export const moderateScale = (size, factor = 0.5) =>
    size + (scale(size) - size) * factor

// Font size helper (keeps things clean)
export const fontSize = size =>
    Math.round(PixelRatio.roundToNearestPixel(scale(size)))