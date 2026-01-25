import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Login from '../../screens/auth/Login'
import Register from '../../screens/auth/Register'
import Otp from '../../screens/auth/Otp'
import CreateProfile from '../../screens/auth/CreateProfile'

const Stack = createNativeStackNavigator()

const Auth = () => {
    return (
        <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false, animation: 'ios_from_right' }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Otp" component={Otp} />
            <Stack.Screen name="CreateProfile" component={CreateProfile} />
        </Stack.Navigator>
    )
}

export default Auth