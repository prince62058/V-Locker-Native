import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  NativeModules,
  Alert,
  BackHandler,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MainView from '../../../components/MainView';
import CustomHeader from '../../../components/header/CustomHeader';
import MainText from '../../../components/MainText';
import { COLORS, FONTS, SIZES, icons } from '../../../constants';
import { Image } from 'react-native';

const { KioskModule } = NativeModules;

const FeatureRow = ({ title, icon, onPress, color = COLORS.primary }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <View style={styles.rowLeft}>
      {/* 
         Using a generic icon if specific ones aren't available matching the user's exact image request 
         or reusing existing icons. 
         For now, I'll use a placeholder View or standard icons if available in imports.
         The user image showed: Prohibition (Disable), Trash (Uninstall), Check (Version).
      */}
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Image source={icon} style={[styles.icon, { tintColor: color }]} />
      </View>
      <MainText style={[styles.rowText, { color: color }]}>{title}</MainText>
    </View>
    <MainText style={{ color: COLORS.black }}> </MainText>
  </TouchableOpacity>
);

const ExtraFeatures = ({ navigation }) => {
  // Track visibility state for each app (false = visible/green, true = hidden/red)
  const [appStates, setAppStates] = useState({
    'com.whatsapp': false,
    'com.instagram.android': false,
    'com.snapchat.android': false,
    'com.google.android.youtube': false,
    'com.facebook.katana': false,
    'com.android.vending': false,
    'com.android.chrome': false,
  });

  const handleDisableReset = async () => {
    try {
      await KioskModule.setFactoryResetAllowed(false);
      Alert.alert('Success', 'Factory Reset has been DISABLED.');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleEnableReset = async () => {
    try {
      await KioskModule.setFactoryResetAllowed(true);
      Alert.alert('Success', 'Factory Reset has been ENABLED.');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleEnableUninstall = async () => {
    try {
      await KioskModule.setUninstallAllowed(true);
      Alert.alert('Success', 'Uninstall has been ENABLED.');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleEnableDeveloperMode = async () => {
    try {
      await KioskModule.setDeveloperOptionsAllowed(true);
      Alert.alert('Success', 'Developer Options (Developer Mode) ENABLED.');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDisableDeveloperMode = async () => {
    try {
      await KioskModule.setDeveloperOptionsAllowed(false);
      Alert.alert('Success', 'Developer Options (Developer Mode) DISABLED.');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <MainView transparent={false}>
      <CustomHeader title="Extra Features" back />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <MainText style={styles.sectionTitle}>Manage Restrictions</MainText>

          <FeatureRow
            title="Disable Reset"
            icon={icons.deactive || icons.logout}
            color={COLORS.red}
            onPress={handleDisableReset}
          />

          <FeatureRow
            title="Enable Reset"
            icon={icons.enrolled || icons.support}
            color={COLORS.green}
            onPress={handleEnableReset}
          />

          <FeatureRow
            title="Enable Uninstall"
            icon={icons.deleteIcon}
            color={COLORS.green}
            onPress={handleEnableUninstall}
          />

          <FeatureRow
            title="Enable Developer Mode"
            icon={icons.enrolled || icons.support}
            color={COLORS.green}
            onPress={handleEnableDeveloperMode}
          />

          <FeatureRow
            title="Disable Developer Mode"
            icon={icons.deactive || icons.logout}
            color={COLORS.red}
            onPress={handleDisableDeveloperMode}
          />
        </View>

        <View style={styles.section}>
          <MainText style={styles.sectionTitle}>
            App Restrictions (Local)
          </MainText>
          <View style={styles.noteBox}>
            <MainText style={styles.noteText}>
              Red = Hidden, Green = Visible. Tap to toggle.
            </MainText>
          </View>

          {[
            { title: 'Hide WhatsApp', pkg: 'com.whatsapp' },
            { title: 'Hide Instagram', pkg: 'com.instagram.android' },
            { title: 'Hide Snapchat', pkg: 'com.snapchat.android' },
            { title: 'Hide YouTube', pkg: 'com.google.android.youtube' },
            { title: 'Hide Facebook', pkg: 'com.facebook.katana' },
            { title: 'Hide Play Store', pkg: 'com.android.vending' },
            { title: 'Hide Chrome', pkg: 'com.android.chrome' },
          ].map((app, index) => {
            const isHidden = appStates[app.pkg];
            return (
              <FeatureRow
                key={index}
                title={app.title}
                icon={icons.support}
                color={isHidden ? COLORS.red : COLORS.green}
                onPress={() => {
                  const appName = app.title.split(' ')[1];
                  Alert.alert(
                    'App Restriction',
                    `${appName} is currently ${
                      isHidden ? 'HIDDEN' : 'VISIBLE'
                    }`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: isHidden ? 'Show' : 'Hide',
                        onPress: async () => {
                          try {
                            await KioskModule.setApplicationHidden(
                              app.pkg,
                              !isHidden,
                            );
                            setAppStates(prev => ({
                              ...prev,
                              [app.pkg]: !isHidden,
                            }));
                            Alert.alert(
                              'Success',
                              `${appName} is now ${
                                !isHidden ? 'HIDDEN' : 'VISIBLE'
                              }`,
                            );
                          } catch (e) {
                            Alert.alert('Error', e.message);
                          }
                        },
                      },
                    ],
                  );
                }}
              />
            );
          })}
        </View>
      </ScrollView>
    </MainView>
  );
};

export default ExtraFeatures;

const styles = StyleSheet.create({
  container: {
    padding: SIZES.width * 0.05,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 20,
    marginLeft: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: COLORS.lightBlack,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  rowText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 25,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: FONTS.medium,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  noteBox: {
    backgroundColor: COLORS.lightGray + '20',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: FONTS.medium,
  },
});
