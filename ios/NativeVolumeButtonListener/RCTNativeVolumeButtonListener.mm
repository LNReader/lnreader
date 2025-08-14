#import "RCTNativeVolumeButtonListener.h"

@implementation RCTNativeVolumeButtonListener

+ (NSString *)moduleName { 
  return @"NativeVolumeButtonListener";
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params { 
  return std::make_shared<facebook::react::NativeVolumeButtonListenerSpecJSI>(params);
}

- (void)addListener:(nonnull NSString *)eventName { 
  // TODO: implement addlistener
}

- (void)removeListeners:(double)count { 
  // TODO: implement count listeners
}

@end
