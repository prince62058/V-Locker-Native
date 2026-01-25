import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { forwardRef, useCallback, useMemo } from 'react'
import { Platform, Pressable, StyleSheet, Text } from 'react-native'
import { COLORS, FONTS, SIZES } from '../../constants'
import Nodata from '../common/nodata/Nodata'

const PaymentSheet = forwardRef(({ selected, onSelect, handleSheetChanges }, ref) => {

    const data = [
        { title: 'Cash', value: 'cash' },
        { title: 'Upi', value: 'upi' },
        { title: 'Auto Pay', value: 'autopay/autodebit' },
    ]

    const snapPoints = useMemo(() => ['70%'], [])


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

    const Option = ({ item }) => {
        const isSelected = selected?.value === item?.value

        return (
            <Pressable
                style={({ pressed }) => [
                    styles.option,
                    isSelected && { backgroundColor: COLORS.primary },
                    pressed && styles.pressed
                ]}
                onPress={() => onSelect(item)}
            >
                <Text style={[
                    styles.label,
                    isSelected && { color: COLORS.white, fontFamily: FONTS.bold }
                ]}>
                    {item.title}
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
                data={data}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Option item={item} />}
                showsVerticalScrollIndicator={false}
                // refreshControl={
                //     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                // }
                ListEmptyComponent={() => <Nodata />}
                contentContainerStyle={
                    (data?.length ? styles.listContent : styles.emptyList)
                }
            />
        </BottomSheetModal>
    )
})

export default PaymentSheet

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
    backdrop: {
        backgroundColor: 'rgba(151, 148, 148, 0.5)',
    },
})
