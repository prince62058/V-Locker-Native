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
            
            // Here we could also reschedule the next alarm if we were using setExact 
            // and wanted to manually handle the repeating logic, 
            // but for now we assume the module schedules it or it's daily.
        }
        // Boot handling will be added later or integrated here if we persist the schedule
    }
}
