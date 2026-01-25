import { NativeModules } from 'react-native';

const { EMIReminder } = NativeModules;

export default {
  /**
   * Schedule EMI Reminders starting 5 days before the due date.
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
