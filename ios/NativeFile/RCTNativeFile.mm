#import "RCTNativeFile.h"

@implementation RCTNativeFile

+ (NSString *)moduleName { 
  return @"NativeFile";
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params { 
  return std::make_shared<facebook::react::NativeFileSpecJSI>(params);
}

- (void)copyFile:(nonnull NSString *)sourcePath destPath:(nonnull NSString *)destPath {
  [[NSFileManager defaultManager] copyItemAtPath:sourcePath toPath:destPath error:nil];
}

- (void)downloadFile:(nonnull NSString *)url destPath:(nonnull NSString *)destPath method:(nonnull NSString *)method headers:(nonnull NSDictionary *)headers body:(nonnull NSString *)body resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
}

- (nonnull NSNumber *)exists:(nonnull NSString *)filePath {
  
  BOOL isExisted = [[NSFileManager defaultManager] fileExistsAtPath:filePath];
  
  return [NSNumber numberWithBool:isExisted];
}

- (NSDictionary *)getConstants {
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths firstObject];
  
  NSArray *cachePaths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
  NSString *cachesDirectory = [cachePaths firstObject];
  
  return @{
    @"ExternalDirectoryPath": documentsDirectory,
    @"ExternalCachesDirectoryPath": cachesDirectory
  };
}

- (void)mkdir:(nonnull NSString *)filePath { 
  [
    [NSFileManager defaultManager] createDirectoryAtPath:filePath withIntermediateDirectories:YES attributes:nil error:nil
  ];
}

- (void)moveFile:(nonnull NSString *)sourcePath destPath:(nonnull NSString *)destPath { 
  [
    [NSFileManager defaultManager] moveItemAtPath:sourcePath toPath:destPath error:nil
  ];
}

- (nonnull NSArray<NSDictionary *> *)readDir:(nonnull NSString *)dirPath { 
  NSMutableArray<NSDictionary *>* res = [NSMutableArray array];
  NSArray *content = [
    [NSFileManager defaultManager]
    contentsOfDirectoryAtPath:dirPath error:nil
  ];
  for(int i=0; i<content.count; i++){
    NSString *fileName = [content objectAtIndex:i];
    NSString *path = [dirPath stringByAppendingFormat:@"%@%@",@"/",fileName];
    BOOL isDir;
    [[NSFileManager defaultManager] fileExistsAtPath:path isDirectory:&isDir];
    [res addObject: @{
      @"name": fileName,
      @"path": path,
      @"isDirectory": @(isDir)
    }];
  }
  return res;
}

- (nonnull NSString *)readFile:(nonnull NSString *)path { 
  return [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:nil];
}

- (void)unlink:(nonnull NSString *)filePath { 
  [
    [NSFileManager defaultManager] removeItemAtPath:filePath error:nil
  ];
}

- (void)writeFile:(nonnull NSString *)path content:(nonnull NSString *)content { 
  [content writeToFile:path atomically:YES encoding:NSUTF8StringEncoding error:nil];
}

- (nonnull facebook::react::ModuleConstants<JS::NativeFile::Constants::Builder>)constantsToExport { 
  return [self getConstants];
}



@end
