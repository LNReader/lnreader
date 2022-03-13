import { useCallback, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useReaderSettingsV1, useSettingsV1, useThemeV1 } from '../redux/hooks';
import {
  changeNavigationBarColor,
  hideNavigationBar,
  showNavigationBar,
} from '../theme/NativeModules/NavigationBarColor';
import { readerBackground } from '../screens/reader/utils/readerStyles';

const useFullscreenMode = () => {
  const { addListener } = useNavigation();
  const readerSettings = useReaderSettingsV1();
  const { fullScreenMode } = useSettingsV1();

  const backgroundColor = readerBackground(readerSettings.theme);

  const theme = useThemeV1();

  const setImmersiveMode = useCallback(() => {
    if (fullScreenMode) {
      StatusBar.setHidden(true);
      hideNavigationBar();
    } else {
      StatusBar.setBackgroundColor(backgroundColor);
      changeNavigationBarColor(backgroundColor as any);
    }
  }, [backgroundColor, fullScreenMode]);

  const showStatusAndNavBar = useCallback(() => {
    StatusBar.setHidden(false);
    showNavigationBar();
  }, []);

  useEffect(() => {
    setImmersiveMode();
  }, [setImmersiveMode]);

  useEffect(() => {
    const unsubscribe = addListener('beforeRemove', () => {
      showStatusAndNavBar();
      StatusBar.setBarStyle(theme.statusBar);
    });

    return unsubscribe;
  }, []);

  return { setImmersiveMode, showStatusAndNavBar };
};

export default useFullscreenMode;
