package com.vlocker

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import android.view.View
import android.view.WindowManager
import com.facebook.react.bridge.ReactMethod
import android.os.PowerManager
import android.app.KeyguardManager
import android.provider.Settings
import android.net.Uri
import android.content.Intent
import android.os.Build

class KioskModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val dpm: DevicePolicyManager = reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
    private val adminComponent = ComponentName(reactContext, MyDeviceAdminReceiver::class.java)

    override fun getName(): String {
        return "KioskModule"
    }

    @ReactMethod
    fun enableKioskMode(promise: Promise) {
        android.util.Log.d("KioskModule", "enableKioskMode called")
        try {
            if (dpm.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                android.util.Log.d("KioskModule", "App is Device Owner. Setting restrictions...")
                
                // 1. Set Lock Task Packages (Allow this app and Settings for internet recovery)
                dpm.setLockTaskPackages(adminComponent, arrayOf(reactApplicationContext.packageName, "com.android.settings"))
                
                // 2. Clear any existing PIN/Password
                try {
                     dpm.resetPassword("", 0)
                } catch (e: Exception) {
                     android.util.Log.e("KioskModule", "Failed to reset password: " + e.message)
                }

                // 3. Disable Status Bar and Keyguard
                dpm.setStatusBarDisabled(adminComponent, true)
                dpm.setKeyguardDisabledFeatures(adminComponent, DevicePolicyManager.KEYGUARD_DISABLE_FEATURES_ALL)
                dpm.setLockTaskFeatures(adminComponent, DevicePolicyManager.LOCK_TASK_FEATURE_NONE)
                
                // Add strict user restrictions
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CREATE_WINDOWS)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_SAFE_BOOT)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_SYSTEM_ERROR_DIALOGS)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_ADJUST_VOLUME)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_MOUNT_PHYSICAL_MEDIA)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_FACTORY_RESET)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_ADD_USER)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_USB_FILE_TRANSFER)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_BLUETOOTH)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_WIFI)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_MOBILE_NETWORKS)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_AIRPLANE_MODE)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_APPS_CONTROL)
                
                // 5. Prevent force-stop and disabling of this app (Temporarily disabled due to build error)
                // dpm.setControlDisabledPackages(adminComponent, arrayOf(reactApplicationContext.packageName))

                android.util.Log.d("KioskModule", "Restrictions set. Starting LockTask...")

                // 4. Force Immersive Mode (Hide Nav Bar & Gestures)
                // UI operations require Activity
                val activity = getCurrentActivity()
                if (activity != null) {
                    activity.runOnUiThread {
                        activity.window.decorView.systemUiVisibility = (
                            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            or View.SYSTEM_UI_FLAG_FULLSCREEN
                            or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        )
                        // Start Lock Task
                        try {
                            val am = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                if (am.lockTaskModeState == android.app.ActivityManager.LOCK_TASK_MODE_NONE) {
                                     activity.startLockTask()
                                     android.util.Log.d("KioskModule", "startLockTask executed")
                                } else {
                                     android.util.Log.d("KioskModule", "Already in LockTask mode, skipping startLockTask")
                                }
                            } else {
                                // For older versions, just try it (or skip if risky, but usually safe to call)
                                if (!am.isInLockTaskMode) {
                                    activity.startLockTask()
                                }
                            }
                        } catch (e: Exception) {
                            android.util.Log.e("KioskModule", "startLockTask FAILED: " + e.message)
                        }
                    }
                } else {
                     android.util.Log.w("KioskModule", "Activity is null, skipping UI-immersive/lockTask steps")
                }
                
                // Save status for JS sync
                val sharedPref = reactApplicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
                sharedPref.edit().putString("last_status", "LOCKED").apply()

                // Always resolve if we are Device Owner, even if UI part skipped (Service will handle lock loop)
                promise.resolve(true)
            } else {
                android.util.Log.e("KioskModule", "App is NOT Device Owner")
                promise.reject("NOT_OWNER", "App is not Device Owner")
            }
        } catch (e: Exception) {
            android.util.Log.e("KioskModule", "Exception: " + e.message)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun disableKioskMode(promise: Promise) {
        try {
            if (dpm.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                // 1. Clear Global Restrictions (Can be done without Activity)
                dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CREATE_WINDOWS)
                dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_SAFE_BOOT)
                dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_SYSTEM_ERROR_DIALOGS)
                dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_ADJUST_VOLUME)
                dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_MOUNT_PHYSICAL_MEDIA)
                dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_ADD_USER)
                dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_USB_FILE_TRANSFER)
                dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_BLUETOOTH)
                dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_WIFI)
                
                // Note: DISALLOW_FACTORY_RESET and DISALLOW_APPS_CONTROL remain active for permanent protection
                
                // 2. Default Features
                dpm.setLockTaskFeatures(adminComponent, DevicePolicyManager.LOCK_TASK_FEATURE_NONE)
                dpm.setStatusBarDisabled(adminComponent, false)
                dpm.setKeyguardDisabledFeatures(adminComponent, DevicePolicyManager.KEYGUARD_DISABLE_FEATURES_NONE)

                // 3. Activity-dependent operations (stopLockTask)
                val activity = getCurrentActivity()
                if (activity != null) {
                    activity.runOnUiThread {
                        try {
                            activity.stopLockTask()
                            activity.window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
                            activity.window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
                            activity.window.decorView.requestLayout()
                        } catch (e: Exception) {
                            android.util.Log.e("KioskModule", "Error in activity-based unpin: " + e.message)
                        }
                    }
                } else {
                    android.util.Log.w("KioskModule", "disableKioskMode: Activity is null, restrictions cleared but stopLockTask skipped.")
                }
                
                // 4. Clear Lock Task Packages (DO only)
                dpm.setLockTaskPackages(adminComponent, arrayOf())
                
                // Save status for JS sync
                val sharedPref = reactApplicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
                sharedPref.edit().putString("last_status", "UNLOCKED").apply()

                promise.resolve(true)
            } else {
                promise.reject("NOT_OWNER", "App is not Device Owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun isDeviceOwner(promise: Promise) {
        try {
            val isOwner = dpm.isDeviceOwnerApp(reactApplicationContext.packageName)
            promise.resolve(isOwner)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setDevicePin(pin: String, promise: Promise) {
        try {
            if (dpm.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                // Ensure we can set password
                // Note: resetPassword is deprecated in API 26+ and may throw or fail silently
                // if a password is already set. However, for Kiosk/DO apps it is the only way.
                val result = dpm.resetPassword(pin, DevicePolicyManager.RESET_PASSWORD_REQUIRE_ENTRY)
                if (result) {
                    promise.resolve(true)
                } else {
                    promise.reject("FAIL", "Failed to set PIN. Ensure no PIN is currently set or App is DO.")
                }
            } else {
                 promise.reject("NOT_OWNER", "App is not Device Owner")
            }
        } catch (e: SecurityException) {
            promise.reject("SECURITY_ERROR", "Security Exception: " + e.message)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearDevicePin(promise: Promise) {
        try {
            if (dpm.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                // Setting to empty string clears it
                val result = dpm.resetPassword("", 0)
                if (result) {
                    promise.resolve(true)
                } else {
                    promise.reject("FAIL", "Failed to clear PIN.")
                }
            } else {
                 promise.reject("NOT_OWNER", "App is not Device Owner")
            }
        } catch (e: SecurityException) {
            promise.reject("SECURITY_ERROR", "Security Exception: " + e.message)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun openWifiSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_WIFI_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun openMobileDataSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_DATA_ROAMING_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun bringAppToFront(promise: Promise) {
        try {
            android.util.Log.d("KioskModule", "Bringing App to Front...")

            val am = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
            val tasks = am.getRunningTasks(1)
            if (tasks.isNotEmpty()) {
                val topActivity = tasks[0].topActivity?.packageName ?: ""
                // If user is in settings (internet recovery), don't kick them out
                if (topActivity.contains("settings")) {
                    android.util.Log.d("KioskModule", "Settings is in front, skipping bringAppToFront")
                    promise.resolve(true)
                    return
                }
                // If app is already in front, don't restart it (prevent jitter)
                if (topActivity == reactApplicationContext.packageName) {
                    android.util.Log.d("KioskModule", "App is already in front, skipping bringAppToFront")
                    promise.resolve(true)
                    return
                }
            }

            wakeUpDevice() // WAKE UP THE DEVICE FIRST

            val packageName = reactApplicationContext.packageName
            val launchIntent = reactApplicationContext.packageManager.getLaunchIntentForPackage(packageName)

            if (launchIntent != null) {
                launchIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                launchIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                launchIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_SINGLE_TOP)
                launchIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP)
                
                // Fallback for background starts: Use PendingIntent (often bypasses restrictions)
                val pendingIntent = android.app.PendingIntent.getActivity(
                    reactApplicationContext, 
                    12345, 
                    launchIntent, 
                    android.app.PendingIntent.FLAG_IMMUTABLE or android.app.PendingIntent.FLAG_UPDATE_CURRENT
                )
                try {
                    pendingIntent.send()
                    android.util.Log.d("KioskModule", "Launched via PendingIntent")
                    promise.resolve(true)
                } catch (e: Exception) {
                    // Fallback to direct start
                    android.util.Log.w("KioskModule", "PendingIntent failed, trying direct startActivity")
                    reactApplicationContext.startActivity(launchIntent)
                    promise.resolve(true)
                }
            } else {
                promise.reject("ERROR", "Launch intent not found")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    private fun wakeUpDevice() {
        try {
            val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            val screenLock = powerManager.newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP or PowerManager.ON_AFTER_RELEASE,
                "VLocker:WakeLock"
            )
            screenLock.acquire(30 * 1000L) // Hold for 30 seconds
            screenLock.release()

            // Keyguard dismissal (UI Thread)
             val activity = getCurrentActivity()
             if (activity != null) {
                 activity.runOnUiThread {
                     if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                         activity.setShowWhenLocked(true)
                         activity.setTurnScreenOn(true)
                         val keyguardManager = reactApplicationContext.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
                         keyguardManager.requestDismissKeyguard(activity, null)
                     } else {
                         activity.window.addFlags(
                             WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                             WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                             WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                             WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                             WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
                         )
                     }
                 }
             } else {
                  android.util.Log.w("KioskModule", "Cannot dismiss keyguard: Activity is null")
             }
        } catch (e: Exception) {
            android.util.Log.e("KioskModule", "WakeUpDevice Error: " + e.message)
        }
    }

    @ReactMethod
    fun hasOverlayPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(Settings.canDrawOverlays(reactApplicationContext))
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun openOverlaySettings(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + reactApplicationContext.packageName)
                )
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        } else {
            promise.resolve(true)
        }
    }
    @ReactMethod
    fun enablePermanentProtections(promise: Promise) {
        try {
            if (dpm.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                // 1. Permanent Factory Reset Protection
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_FACTORY_RESET)
                
                // 2. Permanent Uninstall Protection
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_UNINSTALL_APPS)
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_APPS_CONTROL)
                
                // 3. Block uninstall of VLocker itself
                dpm.setUninstallBlocked(adminComponent, reactApplicationContext.packageName, true)
                
                android.util.Log.d("KioskModule", "Permanent protections enabled: Factory Reset + Uninstall blocked")
                promise.resolve(true)
            } else {
                promise.reject("NOT_OWNER", "App is not Device Owner")
            }
        } catch (e: Exception) {
            android.util.Log.e("KioskModule", "Error enabling permanent protections: " + e.message)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setFactoryResetAllowed(allowed: Boolean, promise: Promise) {
        try {
            if (dpm.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                if (allowed) {
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_FACTORY_RESET)
                } else {
                    dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_FACTORY_RESET)
                }
                promise.resolve(true)
            } else {
                promise.reject("NOT_OWNER", "App is not Device Owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setUninstallAllowed(allowed: Boolean, promise: Promise) {
        try {
            if (dpm.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                 if (allowed) {
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_UNINSTALL_APPS)
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_APPS_CONTROL)
                } else {
                    dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_UNINSTALL_APPS)
                    dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_APPS_CONTROL)
                }
                promise.resolve(true)
            } else {
                promise.reject("NOT_OWNER", "App is not Device Owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setDeveloperOptionsAllowed(allowed: Boolean, promise: Promise) {
        try {
            if (dpm.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                if (allowed) {
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_DEBUGGING_FEATURES)
                    dpm.setGlobalSetting(adminComponent, android.provider.Settings.Global.ADB_ENABLED, "1")
                    dpm.setGlobalSetting(adminComponent, android.provider.Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, "1")
                } else {
                    dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_DEBUGGING_FEATURES)
                    dpm.setGlobalSetting(adminComponent, android.provider.Settings.Global.ADB_ENABLED, "0")
                }
                promise.resolve(true)
            } else {
                promise.reject("NOT_OWNER", "App is not Device Owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun updateWallpaper(enabled: Boolean, wallpaperUrl: String, promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, WallpaperService::class.java)
            if (enabled && !wallpaperUrl.isNullOrEmpty()) {
                intent.putExtra("wallpaperUrl", wallpaperUrl)
                intent.putExtra("isEnabled", true)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    reactApplicationContext.startForegroundService(intent)
                } else {
                    reactApplicationContext.startService(intent)
                }
            } else {
                intent.action = "STOP_SERVICE"
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    reactApplicationContext.startForegroundService(intent)
                } else {
                    reactApplicationContext.startService(intent)
                }
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getDeviceImei(promise: Promise) {
        try {
             if (androidx.core.content.ContextCompat.checkSelfPermission(reactApplicationContext, android.Manifest.permission.READ_PHONE_STATE) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                promise.reject("PERMISSION_DENIED", "READ_PHONE_STATE permission not granted")
                return
            }

            val telephonyManager = reactApplicationContext.getSystemService(Context.TELEPHONY_SERVICE) as? android.telephony.TelephonyManager
            if (telephonyManager == null) {
                promise.reject("ERROR", "TelephonyManager is null")
                return
            }

            val imei = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                telephonyManager.imei
            } else {
                @Suppress("DEPRECATION")
                telephonyManager.deviceId
            }

            if (imei != null) {
                promise.resolve(imei)
            } else {
                promise.reject("ERROR", "IMEI is null")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setLoanPhone(phone: String, promise: Promise) {
        try {
            val sharedPref = reactApplicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            with (sharedPref.edit()) {
                putString("loan_phone", phone)
                commit()
            }
            android.util.Log.d("KioskModule", "Loan Phone saved: $phone")
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setLoanImei(imei: String, promise: Promise) {
        try {
            val sharedPref = reactApplicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            with (sharedPref.edit()) {
                putString("loan_imei", imei)
                commit()
            }
            android.util.Log.d("KioskModule", "Loan IMEI saved: $imei")
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getProvisionedImei(promise: Promise) {
        try {
            val sharedPref = reactApplicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            val loanImei = sharedPref.getString("loan_imei", null)
            promise.resolve(loanImei)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getLockStatus(promise: Promise) {
        try {
            val sharedPref = reactApplicationContext.getSharedPreferences("VLockerPrefs", Context.MODE_PRIVATE)
            val status = sharedPref.getString("last_status", "UNLOCKED")
            promise.resolve(status)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setApplicationHidden(packageName: String, hidden: Boolean, promise: Promise) {
        try {
            if (dpm.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                val result = dpm.setApplicationHidden(adminComponent, packageName, hidden)
                promise.resolve(result)
            } else {
                promise.reject("NOT_OWNER", "App is not Device Owner")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun startBackgroundLockService(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, LockService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(intent)
            } else {
                reactApplicationContext.startService(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopBackgroundLockService(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, LockService::class.java)
            reactApplicationContext.stopService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
