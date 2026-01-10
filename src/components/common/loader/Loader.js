import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { COLORS } from '../../../constants'
import { fontSize } from '../../../utils/fontSize'

const Loader = () => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={fontSize(40)} color={COLORS.primary} />
        </View>
    )
}

export default Loader

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})