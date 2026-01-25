package com.vlocker

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "VLocker"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  private var screenReceiver: ScreenReceiver? = null

  override fun onCreate(savedInstanceState: android.os.Bundle?) {
    super.onCreate(savedInstanceState)
    
    // keyguard handling moved to common function or ensured here
    applyLockScreenFlags()

    // Register Screen Receiver
    val filter = android.content.IntentFilter(android.content.Intent.ACTION_SCREEN_ON)
    filter.addAction(android.content.Intent.ACTION_SCREEN_OFF)
    screenReceiver = ScreenReceiver(application as com.facebook.react.ReactApplication)
    registerReceiver(screenReceiver, filter)

    // Start LockService
    val lockServiceIntent = android.content.Intent(this, LockService::class.java)
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
      startForegroundService(lockServiceIntent)
    } else {
      startService(lockServiceIntent)
    }
  }

  override fun onStart() {
      super.onStart()
      applyLockScreenFlags()
  }

  private fun applyLockScreenFlags() {
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O_MR1) {
          setShowWhenLocked(true)
          setTurnScreenOn(true)
          // keyguardManager.requestDismissKeyguard(this, null) // Optional: might be too aggressive if not locked
      } else {
          window.addFlags(
              android.view.WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
              android.view.WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
              android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
              android.view.WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
          )
      }
  }

  override fun onDestroy() {
      super.onDestroy()
      if (screenReceiver != null) {
          unregisterReceiver(screenReceiver)
      }
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
      super.onWindowFocusChanged(hasFocus)
      if (hasFocus) {
          window.decorView.systemUiVisibility = (
              android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
              or android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
              or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
              or android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
              or android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
              or android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
          )
      }
  }

  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
      // Block back button completely if Kiosk/Device Owner mode is active
      // logic can be added here, or just prevent exit.
  }
}
