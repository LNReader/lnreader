import UIKit
import Expo
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Lottie

@main
class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)
    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions
    )
    
    if let w = window {
      let splashScreenBackground = UIColor(red: 31/255, green: 32/255, blue: 36/255, alpha: 1)
      w.backgroundColor = splashScreenBackground
      w.rootViewController?.view.backgroundColor = splashScreenBackground
      let t = Dynamic()
      let animationSize = CGSize(width: 200, height: 200)
      let screenBounds = UIScreen.main.bounds
      let animationX = (screenBounds.width - animationSize.width) / 2
      let animationY = (screenBounds.height - animationSize.height) / 2
      let animationUIView: UIView = t.createAnimationView(rootView: UIView(frame:CGRect(x: animationX, y: animationY, width: animationSize.width, height: animationSize.height)), lottieName:"loading")
      RNSplashScreen.showLottieSplash(animationUIView, inRootView: w)
      animationUIView.backgroundColor = UIColor(white: 1, alpha:0)
      t.play(animationView: animationUIView as! AnimationView)
      RNSplashScreen.setAnimationFinished(true)
    }

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  
  override func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return RCTLinkingManager.application(application, open: url, options: options);
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
