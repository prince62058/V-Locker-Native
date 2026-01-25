import { StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants';

const MainView = ({ children, mainStyle, transparent = true, bottomSafe = false, leftSafe = false, rightSafe = false }) => {
    const insets = useSafeAreaInsets();

    const paddingTop = transparent ? 0 : insets.top ?? 0;
    const paddingBottom = bottomSafe ? insets.bottom ?? 0 : 0;
    const paddingLeft = bottomSafe ? insets.left ?? 0 : 0;
    const paddingRight = bottomSafe ? insets.right ?? 0 : 0;

    return (

        <View style={[styles.container, mainStyle, { paddingTop, paddingBottom, paddingLeft, paddingRight },]}>
            <StatusBar
                translucent={transparent}
                backgroundColor={transparent ? 'transparent' : COLORS.black}
                barStyle="light-content"
            />
            {children}
        </View>
    );
};

export default MainView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
});