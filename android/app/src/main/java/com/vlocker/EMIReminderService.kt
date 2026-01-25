package com.vlocker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.speech.tts.TextToSpeech
import android.util.Log
import android.content.pm.ServiceInfo
import androidx.core.app.NotificationCompat
import java.util.Locale

class EMIReminderService : Service(), TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private val CHANNEL_ID = "EMI_REMINDER_CHANNEL"
    private val NOTIFICATION_ID = 101
    // "Aapki EMI aane wali hai, kripya samay par bhugtan karein."
    private val HINDI_MESSAGE = """नमस्कार,
आपकी ईएमआई आने वाली है।
कृपया समय पर भुगतान करें।
धन्यवाद।""" 
    private val HINDI_LOCALE = Locale("hi", "IN")

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        tts = TextToSpeech(this, this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createNotification()
        try {
            val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as android.app.admin.DevicePolicyManager
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                if (dpm.isDeviceOwnerApp(packageName)) {
                    try {
                        startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SYSTEM_EXEMPTED)
                    } catch (e: Exception) {
                        Log.e("EMIReminderService", "System Exempted failed, falling back to Data Sync: ${e.message}")
                        startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
                    }
                } else {
                    startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
                }
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
        } catch (e: Exception) {
            Log.e("EMIReminderService", "Failed to start foreground service: ${e.message}")
            stopSelf()
            return START_NOT_STICKY
        }
        
        // TTS will speak in onInit when ready
        return START_NOT_STICKY
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(HINDI_LOCALE)
            
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e("EMIReminderService", "Hindi language is not supported or missing data.")
                // Fallback to English or default if hindi fails, but requirements say Hindi.
                // Try playing anyway, or log error.
            }

            speakMessage()
        } else {
            Log.e("EMIReminderService", "TTS Initialization failed!")
            stopSelf()
        }
    }

    private fun speakMessage() {
        // Play 4 times with silence in between
        for (i in 0 until 4) {
            val mode = if (i == 0) TextToSpeech.QUEUE_FLUSH else TextToSpeech.QUEUE_ADD
            val utteranceId = "EMI_MSG_$i"
            
            // Speak message
            tts?.speak(HINDI_MESSAGE, mode, null, utteranceId)
            
            // Add silence (2 seconds) after each message
            tts?.playSilentUtterance(2000, TextToSpeech.QUEUE_ADD, "SILENCE_$i")
        }
        
        tts?.setOnUtteranceProgressListener(object : android.speech.tts.UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}

            override fun onDone(utteranceId: String?) {
                // Stop service if it's the last silence of the last repetition
                if (utteranceId == "SILENCE_3") {
                    stopSelf()
                }
            }

            override fun onError(utteranceId: String?) {
                // If error occurs, we should likely stop to avoid stuck service
                stopSelf() 
            }
        })
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "EMI Reminder Service",
                NotificationManager.IMPORTANCE_HIGH
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    private fun createNotification(): Notification {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("EMI Reminder")
            .setContentText("Aapki EMI aane wali hai.")
            .setSmallIcon(R.mipmap.ic_launcher) // Ensure this icon exists
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        if (tts != null) {
            tts?.stop()
            tts?.shutdown()
        }
        super.onDestroy()
    }
}
