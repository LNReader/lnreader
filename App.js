import 'react-native-gesture-handler';
import { enableFreeze } from 'react-native-screens';

enableFreeze(true);

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieSplashScreen from 'react-native-lottie-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import * as Notifications from 'expo-notifications';

import { createTables } from '@database/db';
import { persistor, store } from '@redux/store';
import AppErrorBoundary from '@components/AppErrorBoundary/AppErrorBoundary';
import { collectPlugins } from '@plugins/pluginManager';

import Main from './src/navigators/Main';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

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
  useEffect(() => {
    createTables();
    collectPlugins().then(() => LottieSplashScreen.hide());
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <SafeAreaProvider>
              <PaperProvider>
                <BottomSheetModalProvider>
                  <StatusBar translucent={true} backgroundColor="transparent" />
                  <Main />
                </BottomSheetModalProvider>
              </PaperProvider>
            </SafeAreaProvider>
          </PersistGate>
        </Provider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
};

export default App;
