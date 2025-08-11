import 'react-native-url-polyfill/auto';
import { enableFreeze } from 'react-native-screens';

enableFreeze(true);

import React, { useRef } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieSplashScreen from 'react-native-lottie-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications';

import { createTables } from '@database/db';
import AppErrorBoundary from '@components/AppErrorBoundary/AppErrorBoundary';
import { RootStackParamList } from '@navigators/types';

import Main from './src/navigators/Main';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Providers } from './src/providers/Providers';

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
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <Providers>
        <AppErrorBoundary>
          <SafeAreaProvider>
            <PaperProvider>
              <BottomSheetModalProvider>
                <StatusBar translucent={true} backgroundColor="transparent" />
                <Main ref={navigationRef} />
              </BottomSheetModalProvider>
            </PaperProvider>
          </SafeAreaProvider>
        </AppErrorBoundary>
      </Providers>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
