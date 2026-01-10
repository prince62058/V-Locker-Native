import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { forwardRef, useCallback, useMemo } from 'react'
import { Platform, Pressable, StyleSheet, Text } from 'react-native'
import { COLORS, FONTS, SIZES } from '../../constants'
import Nodata from '../common/nodata/Nodata'

const CitySheet = forwardRef(({ listData, selected, onSelect, handleSheetChanges }, ref) => {

    const snapPoints = useMemo(() => ['70%'], [])


    const renderBackdrop = useCallback((props) => (
        <BottomSheetBackdrop
            {...props}
            pressBehavior="close"
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            enableTouchThrough={false}
            opacity={0.2}
        />
    ), [])

    const Option = ({ item }) => {
        const isSelected = selected?.cityName === item?.cityName

        return (
            <Pressable
                style={({ pressed }) => [
                    styles.option,
                    isSelected && { backgroundColor: COLORS.primary + '10' },
                    pressed && styles.pressed
                ]}
                onPress={() => onSelect(item)}
            >
                <Text style={[
                    styles.label,
                    isSelected && { color: COLORS.primary, fontFamily: FONTS.bold }
                ]}>
                    {item.cityName}
                </Text>
            </Pressable>
        )
    }

    return (
        <BottomSheetModal
            ref={ref}
            snapPoints={snapPoints}
            // index={-1}
            backdropComponent={renderBackdrop}
            onChange={handleSheetChanges}
            backgroundStyle={{ backgroundColor: COLORS.lightBlack }}
            handleIndicatorStyle={styles.bar}
            enableOverDrag={false}
            // enableDynamicSizing={false}
            enableContentPanningGesture={false}
        >

            <BottomSheetFlatList
                data={listData?.cities}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Option item={item} />}
                showsVerticalScrollIndicator={false}
                // refreshControl={
                //     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                // }
                ListEmptyComponent={() => <Nodata />}
                contentContainerStyle={
                    (listData?.cities?.length ? styles.listContent : styles.emptyList)
                }
            />
        </BottomSheetModal>
    )
})

export default CitySheet

const styles = StyleSheet.create({
    bar: {
        backgroundColor: COLORS.borderLight,
        width: 50,
        height: 5,
        borderRadius: 2.5,
        alignSelf: 'center',
        marginTop: SIZES.height * 0.01,
    },
    container: {
        paddingBottom: SIZES.height * 0.02,
    },
    option: {
        paddingVertical: SIZES.height * 0.02,
        paddingHorizontal: SIZES.width * 0.05,
    },
    pressed: {
        opacity: Platform.OS === 'ios' ? 0.6 : 1,
    },
    label: {
        fontFamily: FONTS.medium,
        fontSize: SIZES.width * 0.04,
        color: COLORS.white
    },
    listContent: { paddingBottom: SIZES.height * 0.02 },
    emptyList: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
