import {
    Dimensions
} from 'react-native';
const {
    width,
    height
} = Dimensions.get('window');

export const COLORS = {
    border: '#4B4B4B',
    borderLight: '#686868',
    // Primary
    // primary: '#3930D7',
    primary: '#3930D7',

    primary300: '#7872E4',
    primary400: '#5951DD',

    white: '#FFFFFF',
    headingText: '#F8F9FB',
    // black
    black: '#000000',
    lightBlack: '#151515',
    sky: '#559EF0',

    // blue
    blue: '#1C4C9C',
    b1: '#3B82F6',
    b2: '#011E4E',

    //yellow
    yellow: '#A06706',
    y1: '#F59E0B',
    y2: '#432B01',

    //red
    red: '#A52424',
    r1: '#EF4444',
    r2: '#4D0000',
    primaryred: '#FF0000',

    //purple
    purple: '#5C38AD',
    p1: '#8B5CF6',
    p2: '#210B52',

    //linear gradient colors
    lg01: '#14B8A6',
    lg11: '#002C27',

    lg02: '#04453E',
    lg12: '#001D1A',

    lg03: '#4ADE80',
    lg13: '#042410',

    lg04: '#6366F1',
    lg14: '#0D0E3F',

    lg05: '#F97316',
    lg15: '#733306',

    lg06: '#6B7280',
    lg16: '#16171A',

    green: '#008000',

};

export const SIZES = {
    // app dimensions
    width, //360
    height, //800

    radius: width * 0.032, //12
    radius01: width * 0.024, //8


    // font sizes
    largeText: width * 0.083, //32
    h1: width * 0.062, // ~22
    h2: width * 0.052, // ~20
    h3: width * 0.042, // ~16
    h0: width * 0.045, //~18
    h4: width * 0.0378, // ~14
    h5: width * 0.034, // ~12
    h6: width * 0.0299, //~10

    body0: height * 0.03, // approx24
    body1: height * 0.0276, // approx 22 on 800px height
    body2: height * 0.025, // approx 20
    body3: height * 0.02, // approx 16
    body4: height * 0.0176, // approx 14
    body5: height * 0.015, // approx 12
    body6: height * 0.0125, //approx 10
};

export const FONTS = {
    extraBold: 'Rubik-ExtraBold',
    bold: 'Rubik-Bold',
    semiBold: 'Rubik-SemiBold',
    medium: 'Rubik-Medium',
    regular: 'Rubik-Regular',
    light: 'Rubik-Light',
}

export const darkTheme = {
    backgroundColor: COLORS.main,
};

export const lightTheme = {
    backgroundColor: COLORS.white,
};

const appTheme = {
    COLORS,
    SIZES,
    FONTS
};

export default appTheme;