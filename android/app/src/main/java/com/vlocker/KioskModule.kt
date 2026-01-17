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
            val activity = getCurrentActivity()
            if (activity == null) {
                android.util.Log.e("KioskModule", "Activity is null")
                promise.reject("NO_ACTIVITY", "Current activity is null")
                return
            }
            
            if (dpm.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                android.util.Log.d("KioskModule", "App is Device Owner. Setting restrictions...")
                
                // 1. Set Lock Task Packages (Allow only this app)
                dpm.setLockTaskPackages(adminComponent, arrayOf(reactApplicationContext.packageName))
                
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

                android.util.Log.d("KioskModule", "Restrictions set. Starting LockTask...")

                // 4. Force Immersive Mode (Hide Nav Bar & Gestures)
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
                        activity.startLockTask()
                        android.util.Log.d("KioskModule", "startLockTask executed")
                        promise.resolve(true)
                    } catch (e: Exception) {
                        android.util.Log.e("KioskModule", "startLockTask FAILED: " + e.message)
                        promise.reject("LOCK_ERROR", e.message)
                    }
                }
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
        val activity = getCurrentActivity()
        if (activity == null) {
                promise.reject("NO_ACTIVITY", "Current activity is null")
                return
        }

        activity.runOnUiThread {
            try {
                if (dpm.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                    // 1. Clear Global Restrictions that might affect UI
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CREATE_WINDOWS)
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_SAFE_BOOT)
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_SYSTEM_ERROR_DIALOGS)
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_ADJUST_VOLUME)
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_MOUNT_PHYSICAL_MEDIA)
                    // dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_FACTORY_RESET) // Keep this restricted!
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_ADD_USER)
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_USB_FILE_TRANSFER)
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_BLUETOOTH)
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_WIFI)
                    
                    // 2. Set Lock Task Features to defaults
                    dpm.setLockTaskFeatures(adminComponent, DevicePolicyManager.LOCK_TASK_FEATURE_NONE)

                    // 3. Explicitly Re-enable Status Bar & Keyguard
                    dpm.setStatusBarDisabled(adminComponent, false)
                    dpm.setKeyguardDisabledFeatures(adminComponent, DevicePolicyManager.KEYGUARD_DISABLE_FEATURES_NONE)

                    // 4. Stop Lock Task
                    activity.stopLockTask()
                    
                    // 5. Clear Lock Task Packages
                    dpm.setLockTaskPackages(adminComponent, arrayOf())

                    // 6. Force UI Visibility
                    // Reset to stable layout then visible
                    activity.window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
                    
                    // Clear all potentially hiding flags
                    activity.window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
                    activity.window.clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS)
                    activity.window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
                    activity.window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION)
                    
                    // Force redraw
                    activity.window.decorView.requestLayout()

                    promise.resolve(true)
                } else {
                    promise.reject("NOT_OWNER", "App is not Device Owner")
                }
            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
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
    fun bringAppToFront(promise: Promise) {
        try {
            val packageName = reactApplicationContext.packageName
            val launchIntent = reactApplicationContext.packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                // launchIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_REORDER_TO_FRONT) // Optional
                launchIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_SINGLE_TOP)
                reactApplicationContext.startActivity(launchIntent)
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Launch intent not found")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
