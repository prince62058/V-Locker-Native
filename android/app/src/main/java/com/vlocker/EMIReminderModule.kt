package com.vlocker

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Calendar

class EMIReminderModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "EMIReminder"
    }

    @ReactMethod
    fun scheduleReminder(dueDateTimestamp: Double) {
        val dueDate = Calendar.getInstance().apply {
            timeInMillis = dueDateTimestamp.toLong()
        }

        // Start 5 days before
        val startDate = Calendar.getInstance().apply {
            timeInMillis = dueDate.timeInMillis
            add(Calendar.DAY_OF_YEAR, -5)
        }

        val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        // Schedule 3 times a day: 9 AM, 1 PM, 6 PM
        // We will schedule them starting from startDate until dueDate
        // For simplicity/robustness, we can just schedule "Daily" alarms starting from now if we are within the window
        // Or specific one-time alarms for the next occurrences.
        
        // Better approach for reliability: Schedule the NEXT immediate alarm, and let the Receiver schedule the one after that.
        // OR: Schedule Repeating alarms for each slot if possible?
        // AlarmManager setRepeating is inexact.
        // Let's schedule exact alarms for the specific days.
        
        /* TEST MODE: Schedule 1 reminder 10 seconds from NOW for testing
        val testTime = System.currentTimeMillis() + 10000 
        
        val intent = Intent(reactContext, EMIReminderReceiver::class.java).apply {
            action = "com.vlocker.EMI_REMINDER_ALARM"
        }
        val pendingIntent = PendingIntent.getBroadcast(
            reactContext,
            999,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                        alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        testTime,
                        pendingIntent
                    )
                } else {
                        alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        testTime,
                        pendingIntent
                    )
                }
            } else {
                    alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    testTime,
                    pendingIntent
                )
            }
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
        */

        // PRODUCTION LOGIC
        // Loop from -5 days to 0 days
        for (i in 0..5) {
            val checkDate = Calendar.getInstance().apply {
                timeInMillis = startDate.timeInMillis
                add(Calendar.DAY_OF_YEAR, i)
            }
            
            scheduleAlarmForTime(checkDate, 9, 0, alarmManager, i * 10 + 1)
            scheduleAlarmForTime(checkDate, 13, 0, alarmManager, i * 10 + 2)
            scheduleAlarmForTime(checkDate, 18, 0, alarmManager, i * 10 + 3)
        }
    }

    private fun scheduleAlarmForTime(date: Calendar, hour: Int, minute: Int, alarmManager: AlarmManager, requestCode: Int) {
        val alarmTime = Calendar.getInstance().apply {
            timeInMillis = date.timeInMillis
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
        }

        if (alarmTime.timeInMillis > System.currentTimeMillis()) {
            val intent = Intent(reactContext, EMIReminderReceiver::class.java).apply {
                action = "com.vlocker.EMI_REMINDER_ALARM"
            }
            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                requestCode,
                intent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            try {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                    if (alarmManager.canScheduleExactAlarms()) {
                         alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            alarmTime.timeInMillis,
                            pendingIntent
                        )
                    } else {
                         // Fallback or request permission (should be handled in UI)
                         alarmManager.setAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            alarmTime.timeInMillis,
                            pendingIntent
                        )
                    }
                } else {
                     alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        alarmTime.timeInMillis,
                        pendingIntent
                    )
                }
            } catch (e: SecurityException) {
                e.printStackTrace()
            }
        }
    }

    @ReactMethod
    fun stopReminder() {
        val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(reactContext, EMIReminderReceiver::class.java).apply {
            action = "com.vlocker.EMI_REMINDER_ALARM"
        }
        
        // We used requestCodes 1..53 approx (0..5 days * 3 slots)
        // A wider range clean up or better ID management is good.
        // For now, loop same range.
         for (i in 0..5) {
             for (slot in 1..3) {
                 val requestCode = i * 10 + slot
                 val pendingIntent = PendingIntent.getBroadcast(
                    reactContext,
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
    }
}
