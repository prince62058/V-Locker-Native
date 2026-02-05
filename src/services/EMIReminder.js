import { NativeModules } from 'react-native';

const { EMIReminder } = NativeModules;

export default {
  /**
   * Schedule EMI Reminders for 5, 4, 3, 2 days before the due date (single daily notification at 9 AM).
   * Device will automatically lock when the loan becomes overdue.
   * @param {Date|number} dueDate - The EMI due date.
   */
  scheduleReminder: dueDate => {
    const timestamp = new Date(dueDate).getTime();
    EMIReminder.scheduleReminder(timestamp);
  },

  /**
   * Stop all EMI Reminders.
   */
  stopReminder: () => {
    EMIReminder.stopReminder();
  },
};
