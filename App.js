import {enableFreeze} from 'react-native-screens';

enableFreeze(true);

import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';

import {useFonts} from 'expo-font';
import {Provider as PaperProvider} from 'react-native-paper';
import {Provider} from 'react-redux';
import {persistor, store} from './src/redux/store';
import {PersistGate} from 'redux-persist/lib/integration/react';
import * as SplashScreen from 'expo-splash-screen';

import Main from './src/navigators/Main';

import {createDB} from './src/database/DBHelper';
import {fonts} from './src/theme/fonts';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const App = () => {
  const [loaded] = useFonts(fonts);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    createDB();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <PaperProvider>
            <StatusBar translucent={true} backgroundColor="transparent" />
            <Main />
          </PaperProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
