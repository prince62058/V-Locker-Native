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
import android.content.SharedPreferences
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
                        // dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_CONFIG_MOBILE_NETWORKS)
                        // dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_CONFIG_WIFI)
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
            
            // Apply cached policy immediately for offline security
            applyCachedPolicy()
            
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
                    checkPeriodicVoiceReminder()
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
                val sharedPref = applicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
                val loanPhone = sharedPref.getString("loan_phone", "")
                
                Log.d("LockService", "Checking lock status for device: $deviceId, fallback phone: $loanPhone")

                // Make API call
                var apiUrl = "https://v-locker.framekarts.com/api/customerLoan/status/public?imei=$deviceId&t=${System.currentTimeMillis()}"
                if (!loanPhone.isNullOrEmpty()) {
                    apiUrl += "&phone=$loanPhone"
                }

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

                        // Cache nextDueDate if present
                        if (jsonResponse.has("nextDueDate")) {
                            val nextDue = jsonResponse.getString("nextDueDate")
                            if (nextDue != "null" && nextDue.isNotEmpty()) {
                                sharedPref.edit().putString("next_due_date", nextDue).apply()
                                Log.d("LockService", "Cached next_due_date: $nextDue")
                            }
                        } else if (jsonResponse.has("data") && jsonResponse.getJSONObject("data").has("nextDueDate")) {
                            val nextDue = jsonResponse.getJSONObject("data").getString("nextDueDate")
                             if (nextDue != "null" && nextDue.isNotEmpty()) {
                                sharedPref.edit().putString("next_due_date", nextDue).apply()
                                Log.d("LockService", "Cached next_due_date (from data): $nextDue")
                            }
                        }
                        
                        // Handle lock/unlock
                        val lastStatus = sharedPref.getString("last_status", "UNLOCKED")
                        
                        // Save new status
                        with(sharedPref.edit()) {
                            putString("last_status", status)
                            apply()
                        }

                        if (status != lastStatus) {
                             when (status) {
                                "LOCKED" -> {
                                    Log.d("LockService", "Status changed to LOCKED. Enforcing Lock.")
                                    enforceLock()
                                }
                                "UNLOCKED" -> {
                                    Log.d("LockService", "Status changed to UNLOCKED. Releasing Lock.")
                                    releaseLock()
                                }
                            }
                        } else {
                            // Status is same, ensure lock is held if needed
                             if (status == "LOCKED") {
                                // Ensure app is in front, but don't re-enforce kiosk/policies
                                // bringAppToFront() - REMOVED to prevent restart loop
                             }
                        }

                        // Handle policies if changed
                        if (jsonResponse.has("policy")) {
                            val policy = jsonResponse.getJSONObject("policy")
                            val policyStr = policy.toString()
                            val sharedPref = applicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
                            val lastPolicy = sharedPref.getString("last_policy", "")

                            if (policyStr != lastPolicy) {
                                Log.d("LockService", "Policy changed. Applying new policy.")
                                with(sharedPref.edit()) {
                                    putString("last_policy", policyStr)
                                    apply()
                                }
                                applyPolicies(policy)
                            }
                        }
                    }
                } else {
                    Log.e("LockService", "API Error: Response code $responseCode")
                    handleOfflineStatus(sharedPref)
                }
                connection.disconnect()
            } catch (e: Exception) {
                Log.e("LockService", "Error checking lock status: ${e.message}")
                val sharedPref = applicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
                handleOfflineStatus(sharedPref)
            }
        }.start()
    }

    private fun handleOfflineStatus(sharedPref: SharedPreferences) {
        val cachedNextDue = sharedPref.getString("next_due_date", "")
        if (!cachedNextDue.isNullOrEmpty()) {
            try {
                // Parse ISO 8601 date
                val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US)
                sdf.timeZone = java.util.TimeZone.getTimeZone("UTC")
                val dueDate = sdf.parse(cachedNextDue)
                val now = java.util.Date()

                if (dueDate != null && now.after(dueDate)) {
                    Log.w("LockService", "OFFLINE LOCK TRIGGERED: Current time $now is after due date $dueDate")
                    enforceLock()
                } else {
                    Log.d("LockService", "Offline: Still within grace period. Next due: $cachedNextDue")
                    applyCachedPolicy()
                }
            } catch (e: Exception) {
                Log.e("LockService", "Error parsing cached next_due_date: ${e.message}")
                applyCachedPolicy()
            }
        } else {
            Log.d("LockService", "Offline: No cached next_due_date found.")
            applyCachedPolicy()
        }
    }

    private fun enforceLock() {
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

    private fun releaseLock() {
        if (isForeground) {
            stopForeground(true)
            isForeground = false
        }
        disableKioskMode()
    }

    private fun applyCachedPolicy() {
        try {
            val sharedPref = applicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            val lastStatus = sharedPref.getString("last_status", "UNLOCKED")
            val lastPolicy = sharedPref.getString("last_policy", null)

            Log.d("LockService", "Applying cached policy. Status: $lastStatus")

            if (lastStatus == "LOCKED") {
                enforceLock()
            } else {
                releaseLock()
            }

            if (!lastPolicy.isNullOrEmpty()) {
                applyPolicies(JSONObject(lastPolicy))
            }
        } catch (e: Exception) {
            Log.e("LockService", "Error applying cached policy: ${e.message}")
        }
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

    private fun checkPeriodicVoiceReminder() {
        try {
            val sharedPref = applicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            val lastStatus = sharedPref.getString("last_status", "UNLOCKED")
            
            if (lastStatus == "LOCKED") {
                val lastReminderTime = sharedPref.getLong("last_voice_reminder_time", 0L)
                val currentTime = System.currentTimeMillis()
                val sixHoursInMillis = 6 * 60 * 60 * 1000L
                
                if (currentTime - lastReminderTime >= sixHoursInMillis) {
                    Log.d("LockService", "Persistent Overdue Reminder: Playing voice alert.")
                    playVoiceReminder()
                    sharedPref.edit().putLong("last_voice_reminder_time", currentTime).apply()
                }
            }
        } catch (e: Exception) {
            Log.e("LockService", "Error in periodic voice reminder: ${e.message}")
        }
    }

    private fun playVoiceReminder() {
        try {
            val voiceIntent = Intent(this, EMIReminderService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(voiceIntent)
            } else {
                startService(voiceIntent)
            }
        } catch (e: Exception) {
            Log.e("LockService", "Failed to start EMIReminderService: ${e.message}")
        }
    }

    private fun getDeviceIdentifier(): String {
        try {
            // 1. Try to get Loan IMEI from SharedPreferences first
            val sharedPref = applicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            val loanImei = sharedPref.getString("loan_imei", null)
            
            if (!loanImei.isNullOrEmpty()) {
                Log.d("LockService", "Using Loan IMEI: $loanImei")
                return loanImei
            }

            // 2. Fallback to Device IMEI/ID
            val telephonyManager = getSystemService(Context.TELEPHONY_SERVICE) as? android.telephony.TelephonyManager
            val imei = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                try {
                    telephonyManager?.imei 
                } catch (e: SecurityException) {
                    null
                }
            } else {
                @Suppress("DEPRECATION")
                try {
                    telephonyManager?.deviceId
                } catch (e: SecurityException) {
                    null
                }
            }
            
            return imei ?: Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
        } catch (e: Exception) {
            return Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
        }
    }

    private fun enableKioskMode() {
        try {
            if (!dpm.isDeviceOwnerApp(packageName)) {
                Log.e("LockService", "Not device owner, cannot enable kiosk")
                return
            }

            // Set lock task packages (Allow Settings for internet recovery)
            dpm.setLockTaskPackages(adminComponent, arrayOf(packageName, "com.android.settings"))
            
            // Disable status bar and keyguard
            dpm.setStatusBarDisabled(adminComponent, true)
            dpm.setKeyguardDisabledFeatures(adminComponent, DevicePolicyManager.KEYGUARD_DISABLE_FEATURES_ALL)
            dpm.setLockTaskFeatures(adminComponent, DevicePolicyManager.LOCK_TASK_FEATURE_NONE)
            
            // Add user restrictions
            dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CREATE_WINDOWS)
            dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_SAFE_BOOT)
            dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_FACTORY_RESET)
            // dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_WIFI)
            dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_BLUETOOTH)
            dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_MODIFY_ACCOUNTS)
            dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_INSTALL_UNKNOWN_SOURCES)
            
            // Explicitly hide Play Store during hard lock (but allow Settings for WiFi access)
            // setAppHidden("com.android.settings", true)
            setAppHidden("com.android.vending", true)

            // Bring app to front and start lock task
            bringAppToFront()
            
            // Save status for JS sync
            val sharedPref = getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            sharedPref.edit().putString("last_status", "LOCKED").apply()

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
            dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_MODIFY_ACCOUNTS)
            dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_INSTALL_UNKNOWN_SOURCES)
            
            // Re-enable Settings and Play Store
            setAppHidden("com.android.settings", false)
            setAppHidden("com.android.vending", false)
            
            // Re-enable status bar and keyguard
            dpm.setStatusBarDisabled(adminComponent, false)
            dpm.setKeyguardDisabledFeatures(adminComponent, DevicePolicyManager.KEYGUARD_DISABLE_FEATURES_NONE)
            
            // Clear lock task packages
            dpm.setLockTaskPackages(adminComponent, arrayOf())
            
            // Save status for JS sync
            val sharedPref = getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            sharedPref.edit().putString("last_status", "UNLOCKED").apply()

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

            // Handle voice reminder policy
            if (policy.has("isVoiceReminderEnabled")) {
                val isVoiceEnabled = policy.getBoolean("isVoiceReminderEnabled")
                if (isVoiceEnabled) {
                    Log.d("LockService", "Starting EMIReminderService (Voice Alert) from Policy")
                    playVoiceReminder()
                    // Update last reminder time to avoid double play immediately
                    val sharedPref = applicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
                    sharedPref.edit().putLong("last_voice_reminder_time", System.currentTimeMillis()).apply()
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
            // Safety: If the user is in settings (to connect internet), don't force them out
            val am = getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
            val tasks = am.getRunningTasks(1)
            if (tasks.isNotEmpty()) {
                val topActivity = tasks[0].topActivity?.packageName ?: ""
                if (topActivity.contains("settings")) {
                    Log.d("LockService", "Settings is in front, skipping bringAppToFront")
                    return
                }
                if (topActivity == packageName) {
                    Log.d("LockService", "App is already in front, skipping bringAppToFront")
                    return
                }
            }

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
