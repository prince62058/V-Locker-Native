import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
  AuthorizationStatus,
} from '@notifee/react-native';

export async function createNotification(message, fullScreen = false) {
  try {
    await notifee.requestPermission({ alert: true, badge: true, sound: true });

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'General Notifications',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });

    const id = message?.messageId || `msg_${Date.now()}`;
    const title = message?.data?.title || 'New Notification';
    const body = message?.data?.body || 'You have a new notification';

    const androidConfig = {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
    };

    if (fullScreen) {
      androidConfig.fullScreenAction = {
        id: 'default',
        launchActivity: 'default',
      };
      androidConfig.category = 'alarm'; // Helps with priority
      androidConfig.importance = AndroidImportance.HIGH;
    }

    await notifee.displayNotification({
      id,
      title,
      body,
      badge: 5,
      android: androidConfig,
      ios: { categoryId: 'default' },
    });
  } catch (error) {
    // console.log('Error showing notification:', error)
  }
}

export async function setupNotificationListeners() {
  notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('Foreground notification pressed:', detail.notification);
      await clearBadge();
    } else if (type === EventType.DISMISSED) {
      console.log('Foreground notification dismissed:', detail.notification);
    } else {
      await updateBadgeCount();
    }
  });
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('Background notification pressed:', detail.notification?.id);
      await clearBadge();
    } else if (type === EventType.DISMISSED) {
      console.log(
        'Background notification dismissed:',
        detail.notification?.id,
      );
    } else {
      await updateBadgeCount();
    }
  });
}

// Returns true/false based on OS-level notification settings
export async function areNotificationsEnabled() {
  const settings = await notifee.getNotificationSettings();

  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export async function openNotificationSettings() {
  await notifee.openNotificationSettings();
}

/**
 * Cancel a specific notification by ID
 */
export async function cancelNotification(id) {
  try {
    await notifee.cancelNotification(id);
  } catch (error) {
    console.log('Error canceling notification:', error);
  }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications() {
  try {
    await notifee.cancelAllNotifications();
  } catch (error) {
    console.log('Error canceling all notifications:', error);
  }
}

/**
 * Get list of all displayed notifications
 */
export async function getDisplayedNotifications() {
  try {
    const notifications = await notifee.getDisplayedNotifications();
    console.log('Currently displayed notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.log('Error getting notifications:', error);
    return [];
  }
}

// Set badge count
export async function updateBadgeCount() {
  try {
    const notifications = await notifee.getDisplayedNotifications();
    const count = notifications.length; // Or any custom unread count logic
    await notifee.setBadgeCount(count);
  } catch (error) {
    console.log('Error updating badge count:', error);
  }
}

export async function setUnreadBadge(count) {
  try {
    await notifee.setBadgeCount(count); // count can be any number
    console.log('Badge updated:', count);
  } catch (err) {
    console.log('Error setting badge:', err);
  }
}

async function clearBadge() {
  try {
    await notifee.setBadgeCount(0);
  } catch (error) {
    console.log('Error clearing badge count:', error);
  }
}
