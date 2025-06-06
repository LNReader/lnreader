import 'react-native-url-polyfill/auto';
import { enableFreeze } from 'react-native-screens';

enableFreeze(true);

import React, { useRef } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieSplashScreen from 'react-native-lottie-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications';

import { createTables } from '@database/db';
import AppErrorBoundary from '@components/AppErrorBoundary/AppErrorBoundary';

import Main from './src/navigators/Main';

// Rozenite DevTools
import { useReactNavigationDevTools } from '@rozenite/react-navigation-plugin';
import { useNetworkActivityDevTools } from '@rozenite/network-activity-plugin';
import { usePerformanceMonitorDevTools } from '@rozenite/performance-monitor-plugin';
import { useMMKVDevTools } from '@rozenite/mmkv-plugin';
import { store } from '@plugins/helpers/storage';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { NavigationContainerRef } from '@react-navigation/native';

declare global {
  interface ObjectConstructor {
    typedKeys<T>(obj: T): Array<keyof T>;
  }
}
Object.typedKeys = Object.keys as any;

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});
createTables();
LottieSplashScreen.hide();

const App = () => {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  // Enable React Navigation DevTools in development
  useReactNavigationDevTools({ ref: navigationRef });
  useNetworkActivityDevTools();
  usePerformanceMonitorDevTools();
  useMMKVDevTools({
    storages: [store, MMKVStorage],
  });

  return (
    <GestureHandlerRootView style={styles.flex}>
      <AppErrorBoundary>
        <SafeAreaProvider>
          <PaperProvider>
            <BottomSheetModalProvider>
              <StatusBar translucent={true} backgroundColor="transparent" />
              {/* @ts-ignore */}
              <Main ref={navigationRef} />
            </BottomSheetModalProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
