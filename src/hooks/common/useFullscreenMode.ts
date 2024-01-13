import { useCallback, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import color from 'color';
import {
  changeNavigationBarColor,
  hideNavigationBar,
  showNavigationBar,
} from '../../native/NavigationBarColor';
import {
  useChapterGeneralSettings,
  useChapterReaderSettings,
  useTheme,
} from '../persisted';

const useFullscreenMode = () => {
  const { addListener } = useNavigation();
  const readerSettings = useChapterReaderSettings();
  const { fullScreenMode } = useChapterGeneralSettings();

  const backgroundColor = readerSettings.theme;

  const theme = useTheme();

  const setImmersiveMode = useCallback(() => {
    if (fullScreenMode) {
      StatusBar.setHidden(true);
      hideNavigationBar();
    } else {
      StatusBar.setBarStyle(
        color(backgroundColor).isDark() ? 'light-content' : 'dark-content',
      );
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
      StatusBar.setBarStyle(theme.isDark ? 'light-content' : 'dark-content');
    });

    return unsubscribe;
  }, []);

  return { setImmersiveMode, showStatusAndNavBar };
};

export default useFullscreenMode;
