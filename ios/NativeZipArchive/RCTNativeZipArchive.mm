//
//  RCTNativeZipArchive.m
//  LNReader
//
//  Created by QUAN on 18/5/25.
//

#import "RCTNativeZipArchive.h"

@implementation RCTNativeZipArchive

+ (NSString *)moduleName { 
  return @"NativeZipArchive";
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params { 
  return std::make_shared<facebook::react::NativeZipArchiveSpecJSI>(params);
}

- (void)remoteUnzip:(nonnull NSString *)distDirPath url:(nonnull NSString *)url headers:(nonnull NSDictionary *)headers resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
  // TODO: implement remoteUnzip
}

- (void)remoteZip:(nonnull NSString *)sourceDirPath url:(nonnull NSString *)url headers:(nonnull NSDictionary *)headers resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
  // TODO: implement remoteZip
}

- (void)unzip:(nonnull NSString *)sourceFilePath distDirPath:(nonnull NSString *)distDirPath resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
  // TODO: implement unzip
}
- (void)zip:(nonnull NSString *)sourceDirPath zipFilePath:(nonnull NSString *)zipFilePath resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
  // TODO: implement zip
}

@end
