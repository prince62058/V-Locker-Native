import React from "react";
import {
  View,
  Text,
  Dimensions,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { COLORS, FONTS, SIZES, icons } from "../../constants";
// import { Entypo } from "/@expo/vector-icons";

// import { TouchableOpacity } from "react-native-gesture-handler";

const Input = ({
  mainStyle,
  label,
  ref,
  placeholder,
  inputStyle,
  onFocus,
  secureTextEntry,
  secondStyles,
  multiline,
  textAlignVertical,
  numberOfLines,
  disabled=true,
  onPressIn,
  autoFocus,
  onPress,
  iconStyle,
  onChange,
  value,
  editable,
  onChangeText,
  defaultValue,
  placeholderTextColor,
  keyboardType,
  maxLength,
  error,
  errorMsg,
  onBlur,
  icon,
  required,
  password,
  passwordShow,
  eyePress,
  isCalender,
  isDropdown,
  rightImge
}) => {
  return (
    <View style={mainStyle}>
      <View style={[styles.mainInput, secondStyles]}>
        {label && (
          <Text style={styles.lableText}>
            {label} {required && <Text style={{ color: COLORS.red }}>*</Text>}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.input,
            Platform.OS == "ios" && {
              paddingVertical: SIZES.height * 0.015,
              paddingBottom: SIZES.height * 0.015,
            },
            {
              flexDirection: "row",
              alignItems: "center",
              // backgroundColor: COLORS.white,
            },
            inputStyle,
          ]}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <TextInput
            placeholder={placeholder}
            style={[
              styles.textInput,
              { width: password ? "86%" : (icon || isCalender || isDropdown || rightImge) ? "86%" : "98%" },
            ]}
            defaultValue={defaultValue}
            value={value}
            secureTextEntry={secureTextEntry}
            onChangeText={onChangeText}
            // placeholderTextColor={placeholderTextColor}
            placeholderTextColor={COLORS.gray40}
            keyboardType={keyboardType}
            maxLength={maxLength}
            onBlur={onBlur}
            editable={editable}
            onChange={onChange}
            autoFocus={autoFocus}
            onPressIn={onPressIn}
            multiline={multiline}
            numberOfLines={numberOfLines}
            onFocus={onFocus}
            textAlignVertical={textAlignVertical}
            focusable
            cursorColor={COLORS.primary}
          />

          {isCalender && (
            <Image source={icons.calender} resizeMode="contain" style={styles.calender} />
          )}

          {isDropdown && (
            <Image source={icons.downArrow} resizeMode="contain" style={[styles.calender, { marginLeft: SIZES.width * .01 }]} />
          )}

          {rightImge && (
            <Image source={rightImge} resizeMode="contain" style={styles.rightImge} />
          )}



          {/* {password && (
            <TouchableOpacity onPress={eyePress} style={styles.eyeTouch}>
              {passwordShow ? (
                <Entypo name="eye" size={22} color={COLORS.gray70} />
              ) : (
                <Entypo name="eye-with-line" size={22} color={COLORS.gray70} />
              )}
            </TouchableOpacity>
          )} */}
        </TouchableOpacity>
      </View>
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
    </View>
  );
};
export default Input;


const styles = StyleSheet.create({
  mainInput: {},

  textInput: {
    height: SIZES.height * 0.065,
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.width * 0.038,
    color: COLORS.titleColor,
  },
  input: {
    paddingLeft: SIZES.width * 0.03,
    width: "100%",
    borderWidth: 1.5,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    overflow: "hidden",
    height: SIZES.height * 0.065,
    marginTop: SIZES.height * 0.008,
  },
  lableText: {
    color: COLORS.titleColor,
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.width * 0.04,
    // marginBottom: -4,
  },
  errorText: {
    color: "red",
    fontFamily: FONTS.regular,
    fontSize: SIZES.width * 0.028,
    marginTop: SIZES.height * 0.001,
    marginLeft: SIZES.width * 0.005,
    marginBottom: -3,
  },
  iconstyle: {
    width: SIZES.width * 0.062,
    height: SIZES.width * 0.062,
  },
  eyeTouch: {
    width: SIZES.width * 0.12,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  calender: {
    width: SIZES.width * 0.07,
    height: SIZES.width * 0.07,
  },
  rightImge: {
    width: SIZES.width * 0.07,
    height: SIZES.width * 0.07,
  },

});
