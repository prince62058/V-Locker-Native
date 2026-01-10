import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import React from 'react';
import { COLORS, FONTS, SIZES } from '../../../constants';
import { fontSize } from '../../../utils/fontSize';
import MainText from '../../MainText';

const Input2 = ({
  title,
  placeholder,
  value,
  onChangeText,
  maxLength,
  keyboardType,
  keyboardAppearance,
  mainStyle,
  autoCapitalize,
  editable = true,
  onPress,
}) => {
  const handleChange = text => {
    // const digits = text.replace(/[^0-9]/g, '')
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <MainText style={styles.title}>{title}</MainText>
      <Pressable onPress={onPress && onPress}>
        <View style={styles.flex}>
          <TextInput
            placeholder={placeholder}
            value={value}
            onChangeText={handleChange}
            maxLength={maxLength}
            keyboardType={keyboardType}
            keyboardAppearance={keyboardAppearance}
            style={[styles.input, mainStyle]}
            autoCapitalize={autoCapitalize}
            editable={editable}
          />
        </View>
      </Pressable>
    </View>
  );
};

export default Input2;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.width * 0.1,
    marginBottom: SIZES.height * 0.03,
  },
  title: {
    fontSize: fontSize(12),
    color: `${COLORS.white}90`,
  },
  flex: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: fontSize(1),
    borderBottomColor: `${COLORS.white}90`,
  },
  input: {
    flex: 1,
    height: SIZES.height * 0.06,
    color: COLORS.white,
    fontFamily: FONTS.regular,
    fontSize: fontSize(16),
  },
});
