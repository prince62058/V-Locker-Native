import { StyleSheet, Text, TextInput, View } from 'react-native';
import React from 'react';
import { COLORS, FONTS, SIZES } from '../../../constants';
import { fontSize } from '../../../utils/fontSize';
import MainText from '../../MainText';

const Input = ({
  placeholder,
  value,
  onChangeText,
  maxLength,
  keyboardType,
  keyboardAppearance,
  mainStyle,
  showPrefix = true,
  secureTextEntry = false,
  autoCapitalize,
  icon,
  labelStyle,
  inputContainerStyle,
}) => {
  const handleChange = text => {
    // Only filter digits if it's a numeric keyboard (i.e., phone number input)
    if (keyboardType === 'numeric') {
      const digits = text.replace(/[^0-9]/g, '');
      onChangeText(digits);
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={styles.container}>
      <MainText style={[styles.title, labelStyle]}>{placeholder}</MainText>
      <View style={[styles.inputWrapper, inputContainerStyle]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        {showPrefix && <MainText style={styles.prefix}>+91 </MainText>}
        <TextInput
          value={value}
          onChangeText={handleChange}
          maxLength={maxLength}
          keyboardType={keyboardType}
          keyboardAppearance={keyboardAppearance}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          placeholderTextColor={`${COLORS.white}40`}
          style={[
            styles.input,
            mainStyle,
            !showPrefix && !icon && { paddingLeft: SIZES.width * 0.04 },
          ]}
        />
      </View>
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.height * 0.015,
    paddingHorizontal: SIZES.width * 0.08,
  },
  title: {
    fontSize: fontSize(12),
    color: `${COLORS.white}70`,
    textAlign: 'left',
    marginBottom: SIZES.height * 0.008,
    marginLeft: SIZES.width * 0.02,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.white}08`,
    borderRadius: fontSize(12),
    borderWidth: 1,
    borderColor: `${COLORS.white}15`,
    paddingHorizontal: SIZES.width * 0.04,
    height: SIZES.height * 0.065,
  },
  icon: {
    fontSize: fontSize(20),
    marginRight: SIZES.width * 0.03,
  },
  prefix: {
    color: COLORS.white,
    marginRight: SIZES.width * 0.02,
    fontSize: fontSize(16),
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontFamily: FONTS.regular,
    fontSize: fontSize(16),
  },
});
