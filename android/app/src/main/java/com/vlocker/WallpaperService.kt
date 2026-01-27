package com.vlocker

import android.app.*
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.*
import android.util.Log
import android.content.pm.ServiceInfo
import androidx.core.app.NotificationCompat
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

class WallpaperService : Service() {
    private val CHANNEL_ID = "WallpaperServiceChannel"
    private val NOTIFICATION_ID = 2
    private var wallpaperUrl: String? = null
    private var isMonitoringEnabled = false
    private val handler = Handler(Looper.getMainLooper())
    private val executor = Executors.newSingleThreadExecutor()
    
    private val CHECK_INTERVAL = 10000L // 10 seconds

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Initialize notification immediately
        val notification = createNotification()
        
        // Ensure startForeground is called IMMEDIATELY to prevent crash (Android 14+)
        try {
            val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as android.app.admin.DevicePolicyManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                if (dpm.isDeviceOwnerApp(packageName)) {
                    try {
                        startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SYSTEM_EXEMPTED)
                    } catch (e: Exception) {
                        Log.e("WallpaperService", "System Exempted failed, falling back to Data Sync: ${e.message}")
                        startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
                    }
                } else {
                    startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
                }
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
        } catch (e: Exception) {
            Log.e("WallpaperService", "Failed to start foreground service: ${e.message}")
            // Fallback for safety
            startForeground(NOTIFICATION_ID, notification)
        }

        if (intent?.action == "STOP_SERVICE") {
            Log.d("WallpaperService", "Received STOP command. Clearing cache and stopping.")
            stopMonitoringAndClearCache()
            stopSelf()
            return START_NOT_STICKY
        }

        val url = intent?.getStringExtra("wallpaperUrl")
        val enabled = intent?.getBooleanExtra("isEnabled", false) ?: false

        if (url != null && url != wallpaperUrl) {
            wallpaperUrl = url
            Log.d("WallpaperService", "New wallpaper URL: $url")
            downloadAndSetWallpaper(url)
        }

        isMonitoringEnabled = enabled

        if (isMonitoringEnabled) {
            startMonitoring()
        } else {
            stopSelf()
        }

        return START_STICKY
    }

    private fun stopMonitoringAndClearCache() {
        handler.removeCallbacksAndMessages(null)
        isMonitoringEnabled = false
        wallpaperUrl = null
        
        // Delete cached wallpaper so we don't re-apply it next time
        val cacheFile = File(filesDir, "admin_wallpaper.jpg")
        if (cacheFile.exists()) {
            val deleted = cacheFile.delete()
            Log.d("WallpaperService", "Cache file deleted: $deleted")
        }
    }

    private fun startMonitoring() {
        handler.removeCallbacksAndMessages(null)
        handler.postDelayed(object : Runnable {
            override fun run() {
                if (isMonitoringEnabled) {
                    checkAndReapplyWallpaper()
                    handler.postDelayed(this, CHECK_INTERVAL)
                }
            }
        }, CHECK_INTERVAL)
    }

    private fun checkAndReapplyWallpaper() {
        Log.d("WallpaperService", "Periodic check: Re-applying admin wallpaper")
        // Instead of trying to read system wallpaper (which causes permission issues on some android versions),
        // we just re-apply the cached bitmap periodically to ensure it stays set.
        val cacheFile = File(filesDir, "admin_wallpaper.jpg")
        if (cacheFile.exists()) {
            val bitmap = BitmapFactory.decodeFile(cacheFile.absolutePath)
            if (bitmap != null) {
                setDeviceWallpaper(bitmap)
            }
        } else if (wallpaperUrl != null) {
            downloadAndSetWallpaper(wallpaperUrl!!)
        }
    }

    private fun downloadAndSetWallpaper(urlString: String) {
        executor.execute {
            try {
                Log.d("WallpaperService", "Starting download from: $urlString")
                
                var finalUrl = urlString
                if (urlString.contains("localhost")) {
                    finalUrl = urlString.replace("localhost", "10.0.2.2")
                }
                
                val url = URL(finalUrl)
                val connection = url.openConnection() as HttpURLConnection
                connection.connectTimeout = 15000
                connection.readTimeout = 15000
                connection.instanceFollowRedirects = true
                connection.connect()

                val responseCode = connection.responseCode
                if (responseCode != HttpURLConnection.HTTP_OK) {
                    Log.e("WallpaperService", "HTTP Error: $responseCode for URL: $finalUrl")
                    return@execute
                }

                val contentType = connection.contentType
                Log.d("WallpaperService", "Content Type: $contentType, Length: ${connection.contentLength}")

                val input = connection.inputStream
                val bitmap = BitmapFactory.decodeStream(input)
                input.close()

                if (bitmap != null) {
                    Log.d("WallpaperService", "Bitmap decoded: ${bitmap.width}x${bitmap.height}")
                    // Cache the bitmap
                    val cacheFile = File(filesDir, "admin_wallpaper.jpg")
                    FileOutputStream(cacheFile).use { out ->
                        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out)
                    }
                    Log.d("WallpaperService", "Bitmap cached to: ${cacheFile.absolutePath}")

                    // Safety: Clear restriction if it exists
                    try {
                        val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as android.app.admin.DevicePolicyManager
                        val adminComponent = ComponentName(this, MyDeviceAdminReceiver::class.java)
                        if (dpm.isDeviceOwnerApp(packageName)) {
                            dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_SET_WALLPAPER)
                        }
                    } catch (e: Exception) {
                        Log.w("WallpaperService", "Could not clear restriction: ${e.message}")
                    }

                    setDeviceWallpaper(bitmap)
                } else {
                    Log.e("WallpaperService", "Failed to decode bitmap from stream")
                }
            } catch (e: Exception) {
                Log.e("WallpaperService", "Exception in download: ${e.message}")
                e.printStackTrace()
            }
        }
    }

    private fun setDeviceWallpaper(bitmap: Bitmap) {
        try {
            val wallpaperManager = WallpaperManager.getInstance(applicationContext)
            
            // On some devices, we need to check if wallpaper setting is actually allowed
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                if (wallpaperManager.isWallpaperSupported) {
                    // Try setting both System and Lock
                    try {
                        wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM or WallpaperManager.FLAG_LOCK)
                        Log.d("WallpaperService", "Wallpaper set to System and Lock success")
                    } catch (e: Exception) {
                        Log.e("WallpaperService", "Failed to set combined: ${e.message}. Trying System only.")
                        wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM)
                    }
                } else {
                    Log.e("WallpaperService", "Wallpaper NOT supported on this device/user")
                }
            } else {
                wallpaperManager.setBitmap(bitmap)
                Log.d("WallpaperService", "Legacy wallpaper set success")
            }
        } catch (e: Exception) {
            Log.e("WallpaperService", "Critical Error setting wallpaper: ${e.message}")
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Wallpaper Service Channel",
                NotificationManager.IMPORTANCE_MIN
            )
            serviceChannel.setShowBadge(false)
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Security Policy")
            .setContentText("Active")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setShowWhen(false)
            .build()
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        isMonitoringEnabled = false
        super.onDestroy()
    }
}
