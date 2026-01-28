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

            // Start 3 days before
            val startDate = Calendar.getInstance().apply {
                timeInMillis = dueDate.timeInMillis
                add(Calendar.DAY_OF_YEAR, -3)
            }

            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            // Loop from -3 days to 0 days (4 days total)
            for (i in 0..3) {
                val checkDate = Calendar.getInstance().apply {
                    timeInMillis = startDate.timeInMillis
                    add(Calendar.DAY_OF_YEAR, i)
                }
                
                scheduleAlarmForTime(context, checkDate, 9, 0, alarmManager, i * 10 + 1)
                scheduleAlarmForTime(context, checkDate, 19, 0, alarmManager, i * 10 + 2)
            }
            Log.d("EMIReminder", "Scheduled reminders for 3 days ending $dueDateTimestamp")
        }

        private fun scheduleAlarmForTime(context: Context, date: Calendar, hour: Int, minute: Int, alarmManager: AlarmManager, requestCode: Int) {
            val alarmTime = Calendar.getInstance().apply {
                timeInMillis = date.timeInMillis
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
            }

            if (alarmTime.timeInMillis > System.currentTimeMillis()) {
                val intent = Intent(context, EMIReminderReceiver::class.java).apply {
                    action = "com.vlocker.EMI_REMINDER_ALARM"
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
                } catch (e: SecurityException) {
                    Log.e("EMIReminder", "SecurityException scheduling exact alarm: ${e.message}")
                }
            }
        }

        fun clearAllReminders(context: Context) {
            val sharedPref = context.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            sharedPref.edit().remove("emi_due_date_timestamp").apply()

            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, EMIReminderReceiver::class.java).apply {
                action = "com.vlocker.EMI_REMINDER_ALARM"
            }
            
            for (i in 0..3) {
                for (slot in 1..2) {
                    val requestCode = i * 10 + slot
                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        requestCode,
                        intent,
                        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_NO_CREATE
                    )
                    if (pendingIntent != null) {
                        alarmManager.cancel(pendingIntent)
                        pendingIntent.cancel()
                    }
                }
            }
            Log.d("EMIReminder", "Cleared all scheduled reminders")
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
