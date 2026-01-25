import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

const renderBackdrop = useCallback((props) => (
  <BottomSheetBackdrop
    {...props}
    pressBehavior="close"
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    enableTouchThrough={false}
    opacity={0.2}
  />
), []);
const StatusSheet = ({ selected, }) => {
 const [selectedStatus, setSelectedStatus] = useState({ title: 'All', value: 'ALL' });
  const [sheetOpen, setSheetOpen] = useState({ status: false });
  const statusSheetRef = useRef();

  const handlePresent = useCallback(() => {
    statusSheetRef.current?.present();
  }, []);

  const handleDismiss = (() => {
    statusSheetRef.current?.dismiss();
  }, []);

  const handleSheetChange = (key, value) => {
    setSheetOpen((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleStatusSelect = (item) => {
    setSelectedStatus(item);
    handleDismiss();
  };

  useEffect(() => {
    const backAction = () => {
      if (sheetOpen.status) {
        handleDismiss();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [sheetOpen]);

  const options = [
    { title: 'All', value: 'ALL' },
    { title: 'Active', value: 'Active' },
    { title: 'Pending', value: 'Pending' },
    { title: 'Rejected', value: 'Rejected' },
    { title: 'Deactive Devices', value: 'Deactive Devices' },
    { title: 'No Active Devices', value: 'No Active Devices' },
    { title: 'Upcoming EMI', value: 'Upcoming EMI' },
    { title: 'Closed', value: 'Closed' },
  ];

  const Option = ({ item }) => {
    const isSelected = selectedStatus?.value === item.value;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.option,
          isSelected && { backgroundColor: COLORS.primary + '10' },
          pressed && styles.pressed,
        ]}
        onPress={() => handleStatusSelect(item)}
        android_ripple={{ color: COLORS.primary + '20', borderless: false }}
      >
        <Text
          style={[
            styles.label,
            isSelected && { color: COLORS.primary, fontFamily: FONTS.bold },
          ]}
        >
          {item.title}
        </Text>
      </Pressable>
    );
  };

  return (
    <BottomSheetModal
      ref={statusSheetRef}
      index={0}
      backdropComponent={renderBackdrop}
      onChange={(index) => handleSheetChange('status', index >= 0)}
      backgroundStyle={{ backgroundColor: COLORS.white }}
      handleIndicatorStyle={styles.bar}
      enableOverDrag={false}
    >
      <BottomSheetView style={styles.container}>
        {options.map((item) => (
          <Option key={item.value} item={item} />
        ))}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default StatusSheet;

const styles = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.gray,
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
    color: COLORS.black,
    fontFamily: FONTS.medium,
    fontSize: SIZES.width * 0.04,
  },
});
