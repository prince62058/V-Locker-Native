import React from 'react';
import { View, TextInput, Image, Pressable, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS, icons } from '../../constants';

const SearchBox = ({
  value,
  handleChange,
  showFilter = false, // default true
  handleFilter,
  filter,
}) => {
  return (
    <View style={styles.searchview}>
      <View style={styles.inputview}>
        <Image source={icons.Search} style={styles.searchIcon} />
        <TextInput
          value={value}
          onChangeText={handleChange}
          style={styles.searchinput}
          placeholder="Search here..."
          placeholderTextColor={COLORS.border}
        />
      </View>

      {showFilter && (
        <Pressable style={styles.filterview} onPress={handleFilter}>
          <Image
            source={icons.filter}
            resizeMode="contain"
            style={styles.filterIcon}
          />
          {filter && <View style={styles.badge} />}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchview: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: SIZES.width * 0.04,
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  searchIcon: {
    height: SIZES.width * 0.07,
    width: SIZES.width * 0.07,
    resizeMode: 'contain',
  },
  inputview: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    height: SIZES.width * 0.13,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchinput: {
    flex: 1,
    marginLeft: 5,
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.width * 0.045,
    color: COLORS.white,
  },
  filterview: {
    borderWidth: 1.2,
    borderColor: COLORS.borderLight,
    height: SIZES.width * 0.13,
    width: SIZES.width * 0.13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    height: SIZES.width * 0.068,
    width: SIZES.width * 0.068,
    resizeMode: 'contain',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    height: SIZES.width * 0.025,
    width: SIZES.width * 0.025,
    borderRadius: 50,
    backgroundColor: COLORS.red,
  },
});

export default SearchBox;
