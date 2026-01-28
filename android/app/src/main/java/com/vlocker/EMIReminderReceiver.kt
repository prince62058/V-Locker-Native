package com.vlocker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class EMIReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "com.vlocker.EMI_REMINDER_ALARM") {
            val serviceIntent = Intent(context, EMIReminderService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        } else if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val sharedPref = context.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            val dueDateTimestamp = sharedPref.getLong("emi_due_date_timestamp", 0L)
            
            if (dueDateTimestamp > 0L) {
                android.util.Log.d("EMIReminderReceiver", "Device rebooted. Rescheduling EMI reminders for $dueDateTimestamp")
                EMIReminderModule.scheduleAllReminders(context, dueDateTimestamp)
            }
        }
    }
}
