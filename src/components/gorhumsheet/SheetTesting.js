import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback } from 'react'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import MainText from '../MainText'

const SheetTesting = ({ testingSheetRef, handleSheetChanges }) => {

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

    return (
        <BottomSheetModal
            ref={testingSheetRef}
            index={0}
            backdropComponent={renderBackdrop}
            onChange={handleSheetChanges}
        >
            <BottomSheetView>
                <MainText>SheetTesting</MainText>
            </BottomSheetView>
        </BottomSheetModal>
    )
}

export default SheetTesting

const styles = StyleSheet.create({})