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
        try {
            val activity = getCurrentActivity()
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Current activity is null")
                return
            }
            
            if (dpm.isDeviceOwnerApp(reactApplicationContext.packageName)) {
                // Device Owner Status:
                // An app set as Device Owner cannot be uninstalled by the user.
                // This is the primary mechanism preventing uninstallation.

                // 1. Set Lock Task Packages (Allow only this app)
                dpm.setLockTaskPackages(adminComponent, arrayOf(reactApplicationContext.packageName))
                
                // 2. Clear any existing PIN/Password automatically
                try {
                     dpm.resetPassword("", 0)
                } catch (e: Exception) {
                     // Log or ignore if already cleared or failed, but continue kiosk
                }

                // 3. Start Lock Task (Kiosk Mode)
                // This locks the user into this specific app, preventing access to the Home screen or Settings,
                // effectively blocking any route to attempt uninstallation or factory reset.
                activity.startLockTask()
                
                promise.resolve(true)
            } else {
                promise.reject("NOT_OWNER", "App is not Device Owner")
            }
        } catch (e: Exception) {
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
}
