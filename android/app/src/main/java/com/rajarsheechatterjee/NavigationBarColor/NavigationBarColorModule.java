package com.rajarsheechatterjee.LNReader;

import android.animation.ArgbEvaluator;
import android.animation.ValueAnimator;
import android.annotation.TargetApi;
import android.graphics.Color;
import android.os.Build;
import android.app.Activity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.annotation.UiThread;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import java.util.HashMap;
import java.util.Map;
import com.facebook.react.uimanager.IllegalViewOperationException;
import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

public class NavigationBarColorModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "NavigationBarColor";
    private static final String ERROR_NO_ACTIVITY = "E_NO_ACTIVITY";
    private static final String ERROR_NO_ACTIVITY_MESSAGE = "Tried to change the navigation bar while not attached to an Activity";
    private static final String ERROR_API_LEVEL = "API_LEVEl";
    private static final String ERROR_API_LEVEL_MESSAGE = "Only Android Oreo and above is supported";
    private static ReactApplicationContext reactContext = null;
    private static final int UI_FLAG_HIDE_NAV_BAR = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION // hide nav bar
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;

    public NavigationBarColorModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    public void setNavigationBarTheme(Activity activity, Boolean light) {
        if (activity != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Window window = activity.getWindow();
            int flags = window.getDecorView().getSystemUiVisibility();
            if (light) {
                flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            } else {
                flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }
            window.getDecorView().setSystemUiVisibility(flags);
        }
    }


    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("EXAMPLE_CONSTANT", "example");

        return constants;
    }

    @ReactMethod
    public void changeNavigationBarColor(final String color, final Boolean light, final Boolean animated, final Promise promise) {
        final WritableMap map = Arguments.createMap();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            if (getCurrentActivity() != null) {
                try {
                    final Window window = getCurrentActivity().getWindow();
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            if (color.equals("transparent") || color.equals("translucent")) {
                                window.clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
                                window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
                                if (color.equals("transparent")) {
                                    window.setFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS, WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
                                } else {
                                    window.setFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION, WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
                                }
                                setNavigationBarTheme(getCurrentActivity(), light);
                                map.putBoolean("success", true);
                                promise.resolve(map);
                                return;
                            } else {
                                window.clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
                                window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
                            }
                            if (animated) {
                                Integer colorFrom = window.getNavigationBarColor();
                                Integer colorTo = Color.parseColor(String.valueOf(color));
                                //window.setNavigationBarColor(colorTo);
                                ValueAnimator colorAnimation = ValueAnimator.ofObject(new ArgbEvaluator(), colorFrom, colorTo);
                                colorAnimation.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
                                    @Override
                                    public void onAnimationUpdate(ValueAnimator animator) {
                                        window.setNavigationBarColor((Integer) animator.getAnimatedValue());
                                    }
                                });
                                colorAnimation.start();
                            } else {
                                window.setNavigationBarColor(Color.parseColor(String.valueOf(color)));
                            }
                            setNavigationBarTheme(getCurrentActivity(), light);
                            WritableMap map = Arguments.createMap();
                            map.putBoolean("success", true);
                            promise.resolve(map);
                        }
                    });
                } catch (IllegalViewOperationException e) {
                    map.putBoolean("success", false);
                    promise.reject("error", e);
                }

            } else {
                promise.reject(ERROR_NO_ACTIVITY, new Throwable(ERROR_NO_ACTIVITY_MESSAGE));

            }
        } else {
            promise.reject(ERROR_API_LEVEL, new Throwable(ERROR_API_LEVEL_MESSAGE));
        }
    }

    @ReactMethod
    public void hideNavigationBar(Promise promise) {
        try {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (getCurrentActivity() != null) {
                        View decorView = getCurrentActivity().getWindow().getDecorView();
                        decorView.setSystemUiVisibility(UI_FLAG_HIDE_NAV_BAR);
                    }
                }
            });
        } catch (IllegalViewOperationException e) {
            WritableMap map = Arguments.createMap();
            map.putBoolean("success", false);
            promise.reject("error", e);
        }
    }

    @ReactMethod
    public void showNavigationBar(Promise promise) {
        try {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (getCurrentActivity() != null) {
                        Window w = getCurrentActivity().getWindow();
                        w.setStatusBarColor(Color.TRANSPARENT);
                        w.setNavigationBarColor(Color.TRANSPARENT);
                        View decorView = w.getDecorView();
                        decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
                    }
                }
            });
        } catch (IllegalViewOperationException e) {
            WritableMap map = Arguments.createMap();
            map.putBoolean("success", false);
            promise.reject("error", e);
        }
    }
}
