import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { COLORS, FONTS, SIZES } from '../../../constants';

const CustomeInput = ({
  label,
  required,
  dropdown,
  password,
  secure,
  date,
  time,
  mobile,
  otp,
  email,
  placeholder,
  value,
  onChangeText,
  error,
  onPress,
  height,
  width,
  maxLength,
  multiline,
  multiple,
  scanner,
  noteditable,
  onFocus,
  maxValue,
  placeholderTextColor,
  numeric,
}) => {
  const styles = getStyle(height, width, multiline);

  const showPicker = dropdown || date || time || noteditable;
  const editable = !showPicker;

  const getKeyboardType = () => {
    if (mobile || otp || numeric) return 'numeric';
    if (email) return 'email-address';
    return 'default';
  };

  const getAutoCapitalize = () => {
    return email ? 'none' : 'word';
  };

  const getIconName = () => {
    switch (true) {
      case password && secure:
        return 'lock-closed';
      case password && !secure:
        return 'lock-open';
      case dropdown || multiple:
        return 'chevron-down';
      case date:
        return 'calendar';
      case time:
        return 'time';
      case scanner:
        return 'qr-code-scanner';
      default:
        return null;
    }
  };

  const iconName = getIconName();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.lable}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <Pressable style={styles.row} onPress={showPicker ? onPress : undefined}>
        <View style={styles.inputWrapper} pointerEvents="box-none">
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor ?? `${COLORS.white}`}
            value={value}
            secureTextEntry={secure}
            editable={editable}
            keyboardType={getKeyboardType()}
            autoCapitalize={getAutoCapitalize()}
            maxLength={maxLength}
            multiline={multiline}
            style={[styles.input, multiline && styles.multiline]}
            onChangeText={text => {
              if (mobile) {
                const numericText = text.replace(/[^0-9]/g, '');
                onChangeText(numericText);
              } else if (email) {
                const cleanedText = text.replace(/[^a-zA-Z0-9@.]/g, '');
                onChangeText(cleanedText);
              } else {
                onChangeText(text);
              }
            }}
            onFocus={onFocus}
            maxValue={maxValue}
          />
        </View>

        {(showPicker || password || multiple || scanner) && (
          <Pressable style={styles.icon} onPress={onPress}>
            {scanner ? (
              <MaterialIcons
                name={iconName}
                size={SIZES.width * 0.07}
                color={COLORS.white}
              />
            ) : (
              <Ionicons
                name={iconName}
                size={
                  dropdown || time ? SIZES.width * 0.06 : SIZES.width * 0.05
                }
                color={`${COLORS.white}90`}
              />
            )}
          </Pressable>
        )}
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default CustomeInput;

const getStyle = (height, width) =>
  StyleSheet.create({
    container: {
      marginBottom: SIZES.height * 0.015,
    },
    lable: {
      fontFamily: FONTS.regular,
      fontSize: SIZES.width * 0.04,
      color: COLORS.white,
      marginBottom: SIZES.height * 0.005,
    },
    required: {
      color: 'red',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: `${COLORS.white}90`,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: COLORS.lightBlack,
    },
    inputWrapper: {
      flex: 1,
    },
    input: {
      height: height ? height : SIZES.height * 0.065,
      paddingHorizontal: '5%',
      fontFamily: FONTS.regular,
      color: COLORS.white,
      width: width ? width : '100%',
    },
    multiline: {
      height: (height ? height : SIZES.height * 0.07) * 2,
      textAlignVertical: 'top',
    },
    icon: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '15%',
    },
    error: {
      color: 'red',
      fontFamily: FONTS.regular,
      fontSize: SIZES.width * 0.028,
      marginTop: SIZES.height * 0.005,
    },
  });
