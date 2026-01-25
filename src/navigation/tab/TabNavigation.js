import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Home from '../../screens/main/home/Home';
import AddCustomer from '../../screens/main/customer/AddCustomer';
import VerifyCustomer from '../../screens/main/customer/VerifyCustomer';
import Notification from '../../screens/main/notification/Notification';
import Profile from '../../screens/main/profile/Profile';
import UserDashboard from '../../screens/main/home/UserDashboard';
import { COLORS, FONTS, SIZES } from '../../constants';
import BottomTab from '../../components/common/tabbar/BottomTab';
import { useSelector } from 'react-redux';

const Tab = createBottomTabNavigator();

// Screens defined dynamically inside component to access state
const TabNavigation = () => {
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.role === 'admin';

  const screens = isAdmin
    ? [
        {
          name: 'Home',
          component: Home,
          icons: { focused: 'person-add', unfocused: 'person-add-outline' },
          lib: Ionicons,
        },
        {
          name: 'AddCustomer',
          component: AddCustomer,
          icons: { focused: 'person-add', unfocused: 'person-add-outline' },
          lib: Ionicons,
        },
        {
          name: 'Notification',
          component: Notification,
          icons: {
            focused: 'notifications',
            unfocused: 'notifications-outline',
          },
          lib: Ionicons,
        },
        {
          name: 'Profile',
          component: Profile,
          icons: { focused: 'person', unfocused: 'person-outline' },
          lib: Ionicons,
        },
      ]
    : [
        {
          name: 'Dashboard',
          component: UserDashboard,
          icons: { focused: 'home', unfocused: 'home-outline' },
          lib: Ionicons,
        },
        {
          name: 'Notification',
          component: Notification,
          icons: {
            focused: 'notifications',
            unfocused: 'notifications-outline',
          },
          lib: Ionicons,
        },
      ];
  const TabBarButton = ({ children, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={1} style={style.button}>
      {children}
    </TouchableOpacity>
  );

  return (
    <Tab.Navigator
      initialRouteName={isAdmin ? 'Home' : 'Dashboard'}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: `${COLORS.white}90`,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: COLORS.black,
          height: SIZES.height * 0.07,
          paddingBottom: 0,
        },
        tabBarShowLabel: true,
        tabBarButton: props => <TabBarButton {...props} />,
      }}
      tabBar={props => <BottomTab {...props} />}
    >
      {screens.map(({ name, component, icons, lib: IconLib }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <IconLib
                name={focused ? icons.focused : icons.unfocused}
                size={focused ? 22 : 18}
                color={color}
              />
            ),
            tabBarLabel: ({ focused, color }) => (
              <Text
                style={{
                  fontSize: focused ? 11 : 9,
                  color,
                  fontFamily: FONTS.medium,
                }}
              >
                {name}
              </Text>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default TabNavigation;

const style = StyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
