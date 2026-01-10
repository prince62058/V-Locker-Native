export default function AppNavigation() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            initialRouteName="MainTabs"
        >
            <Drawer.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false, title: 'Home' }}
            />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
            {/* Add other drawer-only screens here */}
        </Drawer.Navigator>
    )
}