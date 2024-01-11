import 'react-native-gesture-handler';
import { enableFreeze } from 'react-native-screens';

enableFreeze(true);

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieSplashScreen from 'react-native-lottie-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications';

import { createTables } from '@database/db';
import AppErrorBoundary from '@components/AppErrorBoundary/AppErrorBoundary';
import { collectPlugins } from '@plugins/pluginManager';

import Main from './src/navigators/Main';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { usePlugins } from '@hooks/persisted';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

const App = () => {
  const { refreshPlugins } = usePlugins();
  useEffect(() => {
    createTables();
    collectPlugins().then(() => LottieSplashScreen.hide());
    refreshPlugins();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <SafeAreaProvider>
          <PaperProvider>
            <BottomSheetModalProvider>
              <StatusBar translucent={true} backgroundColor="transparent" />
              <Main />
            </BottomSheetModalProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
};

export default App;
