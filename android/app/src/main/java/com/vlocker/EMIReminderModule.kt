package com.vlocker

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Calendar

class EMIReminderModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "EMIReminder"
    }

    companion object {
        fun scheduleAllReminders(context: Context, dueDateTimestamp: Long) {
            // Persist the due date for boot recovery
            val sharedPref = context.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            sharedPref.edit().putLong("emi_due_date_timestamp", dueDateTimestamp).apply()

            val dueDate = Calendar.getInstance().apply {
                timeInMillis = dueDateTimestamp
            }

            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            // Schedule notifications for 5, 4, 3, 2 days before due date (single notification at 9 AM)
            val daysBeforeDue = listOf(5, 4, 3, 2)
            for ((index, daysOffset) in daysBeforeDue.withIndex()) {
                val notificationDate = Calendar.getInstance().apply {
                    timeInMillis = dueDate.timeInMillis
                    add(Calendar.DAY_OF_YEAR, -daysOffset)
                }
                
                // Single notification at 9 AM
                scheduleAlarmForTime(context, notificationDate, 9, 0, alarmManager, index + 1, "REMINDER")
            }

            // Schedule automatic device lock for overdue date (day 0 at 00:01)
            val overdueDate = Calendar.getInstance().apply {
                timeInMillis = dueDate.timeInMillis
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 1)
                set(Calendar.SECOND, 0)
            }
            scheduleAlarmForTime(context, overdueDate, 0, 1, alarmManager, 5, "LOCK")
            
            Log.d("EMIReminder", "Scheduled reminders for days -5, -4, -3, -2 and auto-lock for overdue date: $dueDateTimestamp")
        }

        private fun scheduleAlarmForTime(context: Context, date: Calendar, hour: Int, minute: Int, alarmManager: AlarmManager, requestCode: Int, alarmType: String) {
            val alarmTime = Calendar.getInstance().apply {
                timeInMillis = date.timeInMillis
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
            }

            if (alarmTime.timeInMillis > System.currentTimeMillis()) {
                val action = if (alarmType == "LOCK") {
                    "com.vlocker.EMI_OVERDUE_LOCK"
                } else {
                    "com.vlocker.EMI_REMINDER_ALARM"
                }
                
                val intent = Intent(context, EMIReminderReceiver::class.java).apply {
                    this.action = action
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    requestCode,
                    intent,
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
                )

                try {
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                        if (alarmManager.canScheduleExactAlarms()) {
                            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, alarmTime.timeInMillis, pendingIntent)
                        } else {
                            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, alarmTime.timeInMillis, pendingIntent)
                        }
                    } else {
                        alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, alarmTime.timeInMillis, pendingIntent)
                    }
                    Log.d("EMIReminder", "Scheduled $alarmType alarm for ${alarmTime.time} with requestCode $requestCode")
                } catch (e: SecurityException) {
                    Log.e("EMIReminder", "SecurityException scheduling exact alarm: ${e.message}")
                }
            }
        }

        fun clearAllReminders(context: Context) {
            val sharedPref = context.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            sharedPref.edit().remove("emi_due_date_timestamp").apply()

            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            
            // Cancel all reminder alarms (requestCodes 1-4)
            for (requestCode in 1..4) {
                val reminderIntent = Intent(context, EMIReminderReceiver::class.java).apply {
                    action = "com.vlocker.EMI_REMINDER_ALARM"
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    requestCode,
                    reminderIntent,
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_NO_CREATE
                )
                if (pendingIntent != null) {
                    alarmManager.cancel(pendingIntent)
                    pendingIntent.cancel()
                }
            }
            
            // Cancel lock alarm (requestCode 5)
            val lockIntent = Intent(context, EMIReminderReceiver::class.java).apply {
                action = "com.vlocker.EMI_OVERDUE_LOCK"
            }
            val lockPendingIntent = PendingIntent.getBroadcast(
                context,
                5,
                lockIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_NO_CREATE
            )
            if (lockPendingIntent != null) {
                alarmManager.cancel(lockPendingIntent)
                lockPendingIntent.cancel()
            }
            
            Log.d("EMIReminder", "Cleared all scheduled reminders and lock alarms")
        }
    }

    @ReactMethod
    fun scheduleReminder(dueDateTimestamp: Double) {
        scheduleAllReminders(reactContext, dueDateTimestamp.toLong())
    }

    @ReactMethod
    fun stopReminder() {
        clearAllReminders(reactContext)
    }
}
