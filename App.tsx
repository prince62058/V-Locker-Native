import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Provider } from 'react-redux';
import AppNavigator from './src/utils/AppNavigator';
import { store } from './src/redux/store';
import DeviceLockService from './src/services/DeviceLockService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

const App = () => {
  useEffect(() => {
    // Start global lock service
    DeviceLockService.startLockService();
    
    return () => {
       DeviceLockService.stopLockService();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
            <BottomSheetModalProvider>
                <View style={styles.container}>
                    <AppNavigator />
                </View>
            </BottomSheetModalProvider>
        </Provider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;