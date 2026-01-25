import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import React from 'react';
import MainText from '../MainText';
import { COLORS, FONTS, SIZES } from '../../constants';
import { fontSize } from '../../utils/fontSize';
import SubmitButton from '../common/button/SubmitButton';
import ToggleButton from '../common/button/ToggleButton';

const DeviceLockModal = ({
  visible = false,
  handleConfirm,
  handleModalToggle,
  onUpdate,
  item = {},
  selectedItems = [], // New prop for bulk
}) => {
  const isBulk = selectedItems.length > 1;
  const displayItem = isBulk ? selectedItems[0] : item;
  const isLocked = displayItem?.deviceUnlockStatus === 'LOCKED';
  const textValue = isLocked ? 'Unlock' : 'Lock';
  const policy = displayItem?.devicePolicy || {};

  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      transparent
      animationType="slide"
      onRequestClose={handleModalToggle}
    >
      <View style={styles.centerWrapper}>
        <View style={styles.container}>
          <MainText style={styles.title}>
            {isBulk
              ? `Bulk Control (${selectedItems.length})`
              : 'Device Control'}
          </MainText>
          <MainText style={styles.desc}>
            {isBulk
              ? 'Applying changes to all selected devices'
              : `${displayItem?.deviceName || 'Device'}\n(ID: ${
                  displayItem?.imeiNumber1 || 'N/A'
                })`}
          </MainText>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Main Lock Toggle */}
            <View style={styles.row}>
              <View>
                <MainText style={styles.label}>Device Lock</MainText>
                <MainText style={styles.sublabel}>
                  Current: {displayItem?.deviceUnlockStatus || 'UNLOCKED'}
                </MainText>
              </View>
              <ToggleButton
                value={isLocked}
                onPress={handleConfirm}
                activeTitle="LOCKED"
                title="UNLOCKED"
              />
            </View>

            <View style={styles.divider} />

            {/* Existing Policies */}
            <View style={styles.row}>
              <View>
                <MainText style={styles.label}>Factory Reset</MainText>
              </View>
              <ToggleButton
                value={policy.isResetAllowed}
                onPress={() => onUpdate('RESET', !policy.isResetAllowed)}
                activeTitle="Allowed"
                title="Blocked"
              />
            </View>

            <View style={styles.row}>
              <View>
                <MainText style={styles.label}>Uninstall App</MainText>
              </View>
              <ToggleButton
                value={policy.isUninstallAllowed}
                onPress={() =>
                  onUpdate('UNINSTALL', !policy.isUninstallAllowed)
                }
                activeTitle="Allowed"
                title="Blocked"
              />
            </View>

            <View style={styles.row}>
              <View>
                <MainText style={styles.label}>Developer Mode</MainText>
              </View>
              <ToggleButton
                value={!policy.isDeveloperOptionsBlocked}
                onPress={() =>
                  onUpdate(
                    'DEV_MODE',
                    !(policy.isDeveloperOptionsBlocked ?? false),
                  )
                }
                activeTitle="Allowed"
                title="Blocked"
              />
            </View>

            <View style={styles.divider} />
            <MainText style={styles.sectionHeader}>App Restrictions</MainText>

            {[
              { id: 'WHATSAPP', label: 'WhatsApp', key: 'isWhatsAppBlocked' },
              {
                id: 'INSTAGRAM',
                label: 'Instagram',
                key: 'isInstagramBlocked',
              },
              { id: 'SNAPCHAT', label: 'Snapchat', key: 'isSnapchatBlocked' },
              { id: 'YOUTUBE', label: 'YouTube', key: 'isYouTubeBlocked' },
              { id: 'FACEBOOK', label: 'Facebook', key: 'isFacebookBlocked' },
              { id: 'DIALER', label: 'Dialer', key: 'isDialerBlocked' },
              { id: 'MESSAGES', label: 'Messages', key: 'isMessagesBlocked' },
              {
                id: 'PLAYSTORE',
                label: 'Play Store',
                key: 'isPlayStoreBlocked',
              },
              { id: 'CHROME', label: 'Chrome', key: 'isChromeBlocked' },
            ].map(app => (
              <View key={app.id} style={styles.row}>
                <View>
                  <MainText style={styles.label}>{app.label}</MainText>
                </View>
                <ToggleButton
                  value={policy[app.key] || false}
                  onPress={() => onUpdate(app.id, !(policy[app.key] || false))}
                  activeTitle="Blocked"
                  title="Allowed"
                />
              </View>
            ))}
          </ScrollView>

          <SubmitButton
            title="Close"
            onPress={handleModalToggle}
            mainStyle={styles.closeBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

export default DeviceLockModal;

const styles = StyleSheet.create({
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  container: {
    width: SIZES.width * 0.95,
    maxHeight: SIZES.height * 0.8,
    backgroundColor: COLORS.black,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  title: {
    fontSize: fontSize(22),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  desc: {
    fontSize: fontSize(14),
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  scroll: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight + '20',
  },
  label: {
    fontSize: fontSize(16),
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  sublabel: {
    fontSize: fontSize(12),
    color: COLORS.gray,
  },
  sectionHeader: {
    fontSize: fontSize(16),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginVertical: 10,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.primary + '30',
    marginVertical: 10,
  },
  closeBtn: {
    marginTop: 20,
    width: '100%',
    backgroundColor: COLORS.red,
    marginHorizontal: 0,
  },
});
