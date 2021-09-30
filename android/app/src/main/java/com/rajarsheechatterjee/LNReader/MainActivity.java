package com.rajarsheechatterjee.LNReader;
import android.content.res.Configuration;
import android.content.Intent;

import android.os.Bundle;
import android.graphics.Color;
import android.view.WindowManager;
import android.os.Build;
import android.view.View;
import android.view.Window;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

import expo.modules.splashscreen.singletons.SplashScreen;
import expo.modules.splashscreen.SplashScreenImageResizeMode;


public class MainActivity extends ReactActivity {

    // Added automatically by Expo Config
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        sendBroadcast(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
      // SplashScreen.show(...) has to be called after super.onCreate(...)
      // Below line is handled by '@expo/configure-splash-screen' command and it's discouraged to modify it manually
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
          WindowManager.LayoutParams layoutParams = new WindowManager.LayoutParams();
          layoutParams.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
          getWindow().setAttributes(layoutParams);
      }

      Window w = getWindow();
      w.setStatusBarColor(Color.TRANSPARENT);
      w.setNavigationBarColor(Color.TRANSPARENT);
      w.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);

      super.onCreate(savedInstanceState);
      SplashScreen.show(this, SplashScreenImageResizeMode.COVER, ReactRootView.class, false);

    }


    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "main";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }
}
