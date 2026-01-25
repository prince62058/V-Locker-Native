import { StyleSheet, View } from 'react-native'
import { SIZES } from '../../../constants'

const Seperator = ({ height = SIZES.height * 0.01 }) => {
    return (
        <View style={[styles.container, { height }]}>
        </View>
    )
}

export default Seperator

const styles = StyleSheet.create({
    container: {
        height: SIZES.height * 0.01
    }
})