package com.vlocker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class EMIReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            "com.vlocker.EMI_REMINDER_ALARM" -> {
                // Show EMI reminder notification with voice
                val serviceIntent = Intent(context, EMIReminderService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
            "com.vlocker.EMI_OVERDUE_LOCK" -> {
                // Automatically lock the device when EMI becomes overdue
                android.util.Log.d("EMIReminderReceiver", "EMI is now overdue. Triggering device lock...")
                
                // Start the main activity which will trigger kiosk mode
                val launchIntent = Intent(context, MainActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    putExtra("AUTO_LOCK_OVERDUE", true)
                }
                context.startActivity(launchIntent)
            }
            Intent.ACTION_BOOT_COMPLETED -> {
                // Reschedule all alarms after device reboot
                val sharedPref = context.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
                val dueDateTimestamp = sharedPref.getLong("emi_due_date_timestamp", 0L)
                
                if (dueDateTimestamp > 0L) {
                    android.util.Log.d("EMIReminderReceiver", "Device rebooted. Rescheduling EMI reminders for $dueDateTimestamp")
                    EMIReminderModule.scheduleAllReminders(context, dueDateTimestamp)
                }
            }
        }
    }
}
