package com.vlocker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.UserManager
import android.util.Log
import android.content.pm.ServiceInfo
import android.net.wifi.WifiManager
import android.provider.Settings
import androidx.core.app.NotificationCompat
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class LockService : Service() {

    private val CHANNEL_ID = "LOCK_SERVICE_CHANNEL"
    private val NOTIFICATION_ID = 100
    private val CHECK_INTERVAL = 5000L // 5 seconds
    private val handler = Handler(Looper.getMainLooper())
    private var isRunning = false
    private var isForeground = false

    private lateinit var dpm: DevicePolicyManager
    private lateinit var adminComponent: ComponentName

    override fun onCreate() {
        super.onCreate()
        Log.d("LockService", "Service Created")
        createNotificationChannel()
        dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        adminComponent = ComponentName(this, MyDeviceAdminReceiver::class.java)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("LockService", "Service Started")
        val notification = createNotification()
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                if (dpm.isDeviceOwnerApp(packageName)) {
                    try {
                        startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SYSTEM_EXEMPTED)
                    } catch (e: Exception) {
                        Log.e("LockService", "System Exempted failed, falling back to Data Sync: ${e.message}")
                        startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
                    }
                    
                    // Enforce Data protection and App control protection
                    try {
                        dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_CONFIG_MOBILE_NETWORKS)
                        dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_CONFIG_WIFI)
                        dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_AIRPLANE_MODE)
                        dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_APPS_CONTROL)
                        dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_UNINSTALL_APPS)
                        
                        // Prevent V-Locker from being force-stopped or data cleared
                        dpm.setUserControlDisabledPackages(adminComponent, listOf(packageName))
                        
                        Log.d("LockService", "Strict device protection enforced")
                    } catch (e: Exception) {
                        Log.e("LockService", "Failed to enforce restrictions: ${e.message}")
                    }
                } else {
                    startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
                }
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
        } catch (e: Exception) {
            Log.e("LockService", "Failed to start foreground service: ${e.message}")
            stopSelf()
            return START_NOT_STICKY
        }
        
        if (!isRunning) {
            isRunning = true
            isForeground = true
            startLockCheckLoop()
        }
        
        return START_STICKY // Restart if killed
    }

    private fun startLockCheckLoop() {
        handler.post(object : Runnable {
            override fun run() {
                if (isRunning) {
                    checkLockStatus()
                    ensureNetworkHealth()
                    handler.postDelayed(this, CHECK_INTERVAL)
                }
            }
        })
    }

    private fun checkLockStatus() {
        Thread {
            try {
                // Get IMEI/Device ID
                val deviceId = getDeviceIdentifier()
                Log.d("LockService", "Checking lock status for device: $deviceId")

                // Make API call
                val apiUrl = "https://vlockerbackend.onrender.com/api/customerLoan/status/public?imei=$deviceId&t=${System.currentTimeMillis()}"

                val url = URL(apiUrl)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 10000
                connection.readTimeout = 10000

                val responseCode = connection.responseCode
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    val response = connection.inputStream.bufferedReader().use { it.readText() }
                    val jsonResponse = JSONObject(response)
                    
                    Log.d("LockService", "API Response: $response")

                    if (jsonResponse.getBoolean("success")) {
                        val status = jsonResponse.getString("status")
                        
                        // Handle lock/unlock
                        when (status) {
                            "LOCKED" -> {
                                Log.d("LockService", "Device should be LOCKED")
                                if (!isForeground) {
                                    val notification = createNotification()
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                                        startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
                                    } else {
                                        startForeground(NOTIFICATION_ID, notification)
                                    }
                                    isForeground = true
                                }
                                enableKioskMode()
                            }
                            "UNLOCKED" -> {
                                Log.d("LockService", "Device should be UNLOCKED")
                                if (isForeground) {
                                    stopForeground(true)
                                    isForeground = false
                                }
                                disableKioskMode()
                            }
                        }

                        // Handle policies if present
                        if (jsonResponse.has("policy")) {
                            val policy = jsonResponse.getJSONObject("policy")
                            applyPolicies(policy)
                        }
                    }
                } else {
                    Log.e("LockService", "API Error: Response code $responseCode")
                }
                connection.disconnect()
            } catch (e: Exception) {
                Log.e("LockService", "Error checking lock status: ${e.message}")
            }
        }.start()
    }

    private fun ensureNetworkHealth() {
        try {
            if (!dpm.isDeviceOwnerApp(packageName)) return

            // 1. Force Airplane Mode OFF
            val isAirplaneModeOn = Settings.Global.getInt(contentResolver, Settings.Global.AIRPLANE_MODE_ON, 0) != 0
            if (isAirplaneModeOn) {
                Log.d("LockService", "Airplane Mode detected ON, forcing OFF")
                dpm.setGlobalSetting(adminComponent, Settings.Global.AIRPLANE_MODE_ON, "0")
            }

            // 2. Force Wi-Fi ON (if possible/needed)
            val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            if (!wifiManager.isWifiEnabled) {
                Log.d("LockService", "Wi-Fi detected OFF, forcing ON")
                @Suppress("DEPRECATION")
                wifiManager.isWifiEnabled = true
            }
        } catch (e: Exception) {
            Log.e("LockService", "Error ensuring network health: ${e.message}")
        }
    }

    private fun getDeviceIdentifier(): String {
        // For emulator testing, use hardcoded IMEI
        return "867400022047199"
        
        // For production, use actual device ID:
        // val telephonyManager = getSystemService(Context.TELEPHONY_SERVICE) as? android.telephony.TelephonyManager
        // return telephonyManager?.imei ?: android.provider.Settings.Secure.getString(contentResolver, android.provider.Settings.Secure.ANDROID_ID)
    }

    private fun enableKioskMode() {
        try {
            if (!dpm.isDeviceOwnerApp(packageName)) {
                Log.e("LockService", "Not device owner, cannot enable kiosk")
                return
            }

            // Set lock task packages
            dpm.setLockTaskPackages(adminComponent, arrayOf(packageName))
            
            // Disable status bar and keyguard
            dpm.setStatusBarDisabled(adminComponent, true)
            dpm.setKeyguardDisabledFeatures(adminComponent, DevicePolicyManager.KEYGUARD_DISABLE_FEATURES_ALL)
            dpm.setLockTaskFeatures(adminComponent, DevicePolicyManager.LOCK_TASK_FEATURE_NONE)
            
            // Add user restrictions
            dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CREATE_WINDOWS)
            dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_SAFE_BOOT)
            dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_FACTORY_RESET)
            dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_WIFI)
            dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_BLUETOOTH)

            // Bring app to front and start lock task
            bringAppToFront()
            
            Log.d("LockService", "Kiosk mode enabled")
        } catch (e: Exception) {
            Log.e("LockService", "Error enabling kiosk: ${e.message}")
        }
    }

    private fun disableKioskMode() {
        try {
            if (!dpm.isDeviceOwnerApp(packageName)) {
                return
            }

            // Clear restrictions
            dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CREATE_WINDOWS)
            dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_SAFE_BOOT)
            dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_WIFI)
            dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_BLUETOOTH)
            
            // Re-enable status bar and keyguard
            dpm.setStatusBarDisabled(adminComponent, false)
            dpm.setKeyguardDisabledFeatures(adminComponent, DevicePolicyManager.KEYGUARD_DISABLE_FEATURES_NONE)
            
            // Clear lock task packages
            dpm.setLockTaskPackages(adminComponent, arrayOf())
            
            Log.d("LockService", "Kiosk mode disabled")
        } catch (e: Exception) {
            Log.e("LockService", "Error disabling kiosk: ${e.message}")
        }
    }

    private fun applyPolicies(policy: JSONObject) {
        try {
            if (!dpm.isDeviceOwnerApp(packageName)) {
                return
            }

            if (policy.has("isResetAllowed")) {
                val allowed = policy.getBoolean("isResetAllowed")
                if (allowed) {
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_FACTORY_RESET)
                } else {
                    dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_FACTORY_RESET)
                }
            }

            if (policy.has("isUninstallAllowed")) {
                val allowed = policy.getBoolean("isUninstallAllowed")
                if (allowed) {
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_UNINSTALL_APPS)
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_APPS_CONTROL)
                } else {
                    dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_UNINSTALL_APPS)
                    dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_APPS_CONTROL)
                }
            }

            if (policy.has("isDeveloperOptionsBlocked")) {
                val blocked = policy.getBoolean("isDeveloperOptionsBlocked")
                if (blocked) {
                    dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_DEBUGGING_FEATURES)
                    dpm.setGlobalSetting(adminComponent, android.provider.Settings.Global.ADB_ENABLED, "0")
                } else {
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_DEBUGGING_FEATURES)
                    dpm.setGlobalSetting(adminComponent, android.provider.Settings.Global.ADB_ENABLED, "1")
                    dpm.setGlobalSetting(adminComponent, android.provider.Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, "1")
                }
                Log.d("LockService", "Developer Options Blocked: $blocked")
            }

            Log.d("LockService", "Policies applied")

            // Handle App Blocking
            handleAppBlocking(policy)

            // Handle wallpaper policy
            if (policy.has("isWallpaperEnabled")) {
                val isEnabled = policy.getBoolean("isWallpaperEnabled")
                val wallpaperUrl = if (policy.has("wallpaperUrl")) policy.getString("wallpaperUrl") else ""
                
                if (isEnabled && wallpaperUrl.isNotEmpty()) {
                    Log.d("LockService", "Starting WallpaperService with URL: $wallpaperUrl")
                    val wallpaperIntent = Intent(this, WallpaperService::class.java)
                    wallpaperIntent.putExtra("wallpaperUrl", wallpaperUrl)
                    wallpaperIntent.putExtra("isEnabled", true)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        startForegroundService(wallpaperIntent)
                    } else {
                        startService(wallpaperIntent)
                    }
                } else {
                    Log.d("LockService", "Stopping WallpaperService and clearing cache")
                    val wallpaperIntent = Intent(this, WallpaperService::class.java)
                    wallpaperIntent.action = "STOP_SERVICE"
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        startForegroundService(wallpaperIntent)
                    } else {
                        startService(wallpaperIntent)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("LockService", "Error applying policies: ${e.message}")
        }
    }

    private fun handleAppBlocking(policy: JSONObject) {
        val isDO = dpm.isDeviceOwnerApp(packageName)
        Log.d("LockService", "handleAppBlocking called. IsDeviceOwner: $isDO, Policy: $policy")
        if (!isDO) return

        try {
            // Social Apps
            if (policy.has("isWhatsAppBlocked")) {
                val blocked = policy.getBoolean("isWhatsAppBlocked")
                Log.d("LockService", "WhatsApp Block Policy: $blocked")
                setAppHidden("com.whatsapp", blocked)
            }
            if (policy.has("isInstagramBlocked")) {
                val blocked = policy.getBoolean("isInstagramBlocked")
                Log.d("LockService", "Instagram Block Policy: $blocked")
                setAppHidden("com.instagram.android", blocked)
            }
            if (policy.has("isSnapchatBlocked")) {
                val blocked = policy.getBoolean("isSnapchatBlocked")
                Log.d("LockService", "Snapchat Block Policy: $blocked")
                setAppHidden("com.snapchat.android", blocked)
            }
            if (policy.has("isYouTubeBlocked")) {
                val blocked = policy.getBoolean("isYouTubeBlocked")
                Log.d("LockService", "YouTube Block Policy: $blocked")
                setAppHidden("com.google.android.youtube", blocked)
            }
            if (policy.has("isFacebookBlocked")) {
                val fbPackages = arrayOf("com.facebook.katana", "com.facebook.lite", "com.facebook.orca")
                val blocked = policy.getBoolean("isFacebookBlocked")
                Log.d("LockService", "Facebook Block Policy: $blocked")
                fbPackages.forEach { setAppHidden(it, blocked) }
            }

            // Dialer
            if (policy.has("isDialerBlocked")) {
                val dialerPackages = arrayOf(
                    "com.google.android.dialer",
                    "com.android.dialer",
                    "com.samsung.android.dialer",
                    "com.samsung.android.contacts",
                    "com.bbk.launcher2", // Some Vivo models
                    "com.incallui"
                )
                val blocked = policy.getBoolean("isDialerBlocked")
                Log.d("LockService", "Dialer Block Policy: $blocked")
                dialerPackages.forEach { setAppHidden(it, blocked) }
            }

            // Messages
            if (policy.has("isMessagesBlocked")) {
                val msgPackages = arrayOf(
                    "com.google.android.apps.messaging",
                    "com.android.messaging",
                    "com.samsung.android.messaging",
                    "com.android.mms"
                )
                val blocked = policy.getBoolean("isMessagesBlocked")
                Log.d("LockService", "Messages Block Policy: $blocked")
                msgPackages.forEach { setAppHidden(it, blocked) }
            }

            // Play Store
            if (policy.has("isPlayStoreBlocked")) {
                val blocked = policy.getBoolean("isPlayStoreBlocked")
                Log.d("LockService", "PlayStore Block Policy: $blocked")
                setAppHidden("com.android.vending", blocked)
            }

            // Chrome
            if (policy.has("isChromeBlocked")) {
                val blocked = policy.getBoolean("isChromeBlocked")
                Log.d("LockService", "Chrome Block Policy: $blocked")
                setAppHidden("com.android.chrome", blocked)
            }
        } catch (e: Exception) {
            Log.e("LockService", "Error in handleAppBlocking: ${e.message}")
        }
    }

    private fun setAppHidden(pkg: String, hide: Boolean) {
        try {
            // Use MATCH_ALL or MATCH_UNINSTALLED_PACKAGES if needed, but 0 is usually fine with QUERY_ALL_PACKAGES
            Log.d("LockService", "Attempting to set $pkg hidden and suspended to $hide")
            
            // 1. Try to set packages suspended (shows "App disabled by admin")
            val suspendedResult = dpm.setPackagesSuspended(adminComponent, arrayOf(pkg), hide)
            val isSuspended = if (suspendedResult.isEmpty()) "Success" else "Failed for: ${suspendedResult.joinToString()}"
            Log.d("LockService", "App $pkg suspension result: $isSuspended")

            // 2. Try to hide the package from launcher
            val result = dpm.setApplicationHidden(adminComponent, pkg, hide)
            Log.d("LockService", "App $pkg hidden status set to: $hide, Result: $result")
            
        } catch (e: Exception) {
            Log.e("LockService", "Error setting hidden/suspended state for $pkg: ${e.message}")
        }
    }

    private fun bringAppToFront() {
        try {
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                startActivity(launchIntent)
            }
        } catch (e: Exception) {
            Log.e("LockService", "Error bringing app to front: ${e.message}")
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Device Lock Service",
                NotificationManager.IMPORTANCE_MIN
            )
            channel.description = "Keeps device secure"
            channel.setShowBadge(false)
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
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
            .setContentTitle("System Service")
            .setContentText("Status: Syncing")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setCategory(Notification.CATEGORY_SERVICE)
            .setOngoing(true)
            .setShowWhen(false)
            .setVisibility(NotificationCompat.VISIBILITY_SECRET)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        Log.d("LockService", "Service Destroyed")
        isRunning = false
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
        
        // Restart service if killed
        val restartIntent = Intent(applicationContext, LockService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            applicationContext.startForegroundService(restartIntent)
        } else {
            applicationContext.startService(restartIntent)
        }
    }
    private fun isEmulator(): Boolean {
        return (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic")
                || Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.HARDWARE.contains("goldfish")
                || Build.HARDWARE.contains("ranchu")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || Build.PRODUCT.contains("sdk_google")
                || Build.PRODUCT.contains("google_sdk")
                || Build.PRODUCT.contains("sdk")
                || Build.PRODUCT.contains("sdk_x86")
                || Build.PRODUCT.contains("vbox86p")
                || Build.PRODUCT.contains("emulator")
                || Build.PRODUCT.contains("simulator"))
    }
}
