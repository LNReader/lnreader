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
import {SafeAreaProvider} from 'react-native-safe-area-context';

const App = () => {
  const fonts = {
    'pt-sans-bold': require('./android/app/src/main/assets/fonts/pt-sans-bold.ttf'),
    'arbutus-slab': require('./android/app/src/main/assets/fonts/arbutus-slab.ttf'),
    domine: require('./android/app/src/main/assets/fonts/domine.ttf'),
    lato: require('./android/app/src/main/assets/fonts/lato.ttf'),
    'noto-sans': require('./android/app/src/main/assets/fonts/noto-sans.ttf'),
    'open-sans': require('./android/app/src/main/assets/fonts/open-sans.ttf'),
    'pt-serif': require('./android/app/src/main/assets/fonts/pt-serif.ttf'),
    lora: require('./android/app/src/main/assets/fonts/lora.ttf'),
    nunito: require('./android/app/src/main/assets/fonts/nunito.ttf'),
    openDyslexic: require('./android/app/src/main/assets/fonts/OpenDyslexic3-Regular.ttf'),
  };

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
