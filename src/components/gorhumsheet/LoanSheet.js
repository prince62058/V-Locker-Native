import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { forwardRef, useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { COLORS, FONTS, SIZES } from '../../constants'
import { fontSize } from '../../utils/fontSize'
import SubmitButton from '../common/button/SubmitButton'
import Seperator from '../common/seperator/Seperator'

const LoanSheet = forwardRef(({
    handleSheetChanges,
    selectedFilterValue,
    handleSelectFilter,
    handleRemoveFilter,
    handleFilter
}, ref) => {


    const renderBackdrop = useCallback((props) => (
        <BottomSheetBackdrop
            {...props}
            pressBehavior="close"
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            enableTouchThrough={false}
            style={styles.backdrop}
        />
    ), [])

    const isSelected = (value) => {
        if (Array.isArray(selectedFilterValue)) return selectedFilterValue.includes(value)
        return selectedFilterValue === value
    }

    const toggleSelection = (value) => {
        if (isSelected(value)) {
            handleRemoveFilter && handleRemoveFilter(value)
        } else {
            handleSelectFilter && handleSelectFilter(value)
        }
    }

    const clearAll = () => {
        handleRemoveFilter && handleRemoveFilter()
    }

    return (
        <BottomSheetModal
            ref={ref}
            enableDynamicSizing={true}
            backdropComponent={renderBackdrop}
            onChange={handleSheetChanges}
            backgroundStyle={styles.sheetBackground}
            handleIndicatorStyle={styles.bar}
            enableOverDrag={false}
            enableContentPanningGesture={false}
        >

            <BottomSheetView>

                <View style={styles.headerRow}>
                    <Text style={styles.title}>Selection</Text>

                    {selectedFilterValue && selectedFilterValue.length > 0 ? (
                        <Pressable onPress={clearAll} style={styles.clearButton}>
                            <Text style={styles.clearText}>Clear</Text>
                        </Pressable>
                    ) : null}
                </View>

                <View style={styles.itemContainer}>
                    <Pressable
                        onPress={() => toggleSelection('runningDevice')}
                        style={[styles.filterItem, isSelected('runningDevice') && styles.selectedItem]}
                    >
                        <Text style={[styles.itemText, isSelected('runningDevice') && styles.selectedItemText]}>Active Devices</Text>
                    </Pressable>
                    <Seperator />
                    <Pressable
                        onPress={() => toggleSelection('deactivateDevices')}
                        style={[styles.filterItem, isSelected('deactivateDevices') && styles.selectedItem]}
                    >
                        <Text style={[styles.itemText, isSelected('deactivateDevices') && styles.selectedItemText]}>Deactivated Devices</Text>
                    </Pressable>
                    <Seperator />
                    <Pressable
                        onPress={() => toggleSelection('notActiveDevices')}
                        style={[styles.filterItem, isSelected('notActiveDevices') && styles.selectedItem]}
                    >
                        <Text style={[styles.itemText, isSelected('notActiveDevices') && styles.selectedItemText]}>Not Active Devices</Text>
                    </Pressable>
                    <Seperator />
                    {/* <Pressable
                        onPress={() => toggleSelection('UNLOCKED')}
                        style={[styles.filterItem, isSelected('UNLOCKED') && styles.selectedItem]}
                    >
                        <Text style={[styles.itemText, isSelected('UNLOCKED') && styles.selectedItemText]}>Active</Text>
                    </Pressable>
                    <Seperator /> */}
                    {/* <Pressable
                        onPress={() => toggleSelection('UNLOCKED')}
                        style={[styles.filterItem, isSelected('UNLOCKED') && styles.selectedItem]}
                    >
                        <Text style={[styles.itemText, isSelected('UNLOCKED') && styles.selectedItemText]}>Pending</Text>
                    </Pressable>
                    <Seperator /> */}
                    <Pressable
                        onPress={() => toggleSelection('lockedDevices')}
                        style={[styles.filterItem, isSelected('lockedDevices') && styles.selectedItem]}
                    >
                        <Text style={[styles.itemText, isSelected('lockedDevices') && styles.selectedItemText]}>Locked Devices</Text>
                    </Pressable>
                    <Seperator />
                    <Pressable
                        onPress={() => toggleSelection('upcomingEmis')}
                        style={[styles.filterItem, isSelected('upcomingEmis') && styles.selectedItem]}
                    >
                        <Text style={[styles.itemText, isSelected('upcomingEmis') && styles.selectedItemText]}>Upcoming Emis</Text>
                    </Pressable>
                    <Seperator />
                    {/* <Pressable
                        onPress={() => toggleSelection('UNLOCKED')}
                        style={[styles.filterItem, isSelected('UNLOCKED') && styles.selectedItem]}
                    >
                        <Text style={[styles.itemText, isSelected('UNLOCKED') && styles.selectedItemText]}>Closed</Text>
                    </Pressable>
                    <Seperator /> */}
                </View>

                <SubmitButton title='Apply' onPress={handleFilter} />
                <Seperator />

            </BottomSheetView>

        </BottomSheetModal>
    )
})

export default LoanSheet


const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: COLORS.black
    },

    bar: {
        backgroundColor: COLORS.borderLight,
        width: 50,
        height: 5,
        borderRadius: 2.5,
        alignSelf: 'center',
        marginTop: SIZES.height * 0.01,
    },

    backdrop: {
        backgroundColor: 'rgba(151, 148, 148, 0.5)',
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: SIZES.width * 0.05
    },

    title: {
        color: COLORS.white,
        fontSize: fontSize(18),
        fontFamily: FONTS.medium
    },

    clearButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.width * 0.04,
        paddingVertical: SIZES.height * 0.005,
        borderRadius: fontSize(10)
    },

    clearText: {
        color: COLORS.white,
        fontSize: fontSize(15),
        fontFamily: FONTS.medium
    },

    filterTabContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: SIZES.width * 0.05,
        marginTop: SIZES.height * 0.01,
        borderWidth: 2,
        borderColor: COLORS.borderLight,
        borderRadius: fontSize(50),
        padding: fontSize(4)
    },

    filterTab: {
        backgroundColor: COLORS.black,
        width: SIZES.width * 0.43,
        height: SIZES.height * 0.05,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fontSize(20)
    },

    activeFilterTab: {
        backgroundColor: COLORS.primary
    },

    filterText: {
        color: COLORS.white,
        fontSize: fontSize(15),
        fontFamily: FONTS.medium
    },

    chipsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginHorizontal: SIZES.width * 0.05,
        marginTop: SIZES.height * 0.012,
    },

    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderWidth: 2,
        borderColor: COLORS.borderLight,
        paddingHorizontal: SIZES.width * 0.015,
        paddingVertical: SIZES.height * 0.004,
        borderRadius: fontSize(6),
        marginRight: SIZES.width * 0.005,
    },

    chipText: {
        color: COLORS.white,
        fontSize: fontSize(12),
        fontFamily: FONTS.medium,
        marginRight: SIZES.width * 0.01
    },

    chipClose: {
        paddingVertical: fontSize(2)
    },

    chipCloseText: {
        color: COLORS.white,
        fontSize: fontSize(10),
        fontFamily: FONTS.medium
    },

    itemContainer: {
        marginHorizontal: SIZES.width * 0.05,
        marginTop: SIZES.height * 0.01
    },

    filterItem: {
        borderWidth: 1,
        borderColor: COLORS.lightBlack,
        backgroundColor: COLORS.lightBlack,
        height: SIZES.height * 0.06,
        justifyContent: 'center',
        paddingHorizontal: SIZES.width * 0.05,
        borderRadius: fontSize(5)
    },

    selectedItem: {
        borderColor: COLORS.primary,
    },

    itemText: {
        color: COLORS.white,
        fontSize: fontSize(18),
        fontFamily: FONTS.regular
    },

    selectedItemText: {
        color: COLORS.white,
        fontFamily: FONTS.medium
    }
})
