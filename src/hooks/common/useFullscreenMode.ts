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
import Color from 'color';

const useFullscreenMode = () => {
  const { addListener } = useNavigation();
  const { theme: backgroundColor } = useChapterReaderSettings();
  const { fullScreenMode } = useChapterGeneralSettings();
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
      changeNavigationBarColor(backgroundColor);
    }
  }, [backgroundColor, fullScreenMode]);

  const showStatusAndNavBar = useCallback(() => {
    StatusBar.setHidden(false);
    showNavigationBar();
    changeNavigationBarColor(Color(theme.surface).hex(), !theme.isDark);
  }, []);

  useEffect(() => {
    setImmersiveMode();
  }, [setImmersiveMode]);

  useEffect(() => {
    const unsubscribe = addListener('beforeRemove', () => {
      showStatusAndNavBar();
      StatusBar.setBarStyle(theme.isDark ? 'light-content' : 'dark-content');
      changeNavigationBarColor(
        Color(theme.surface2).hex(),
        !theme.isDark,
        true,
      );
    });

    return unsubscribe;
  }, []);

  return { setImmersiveMode, showStatusAndNavBar };
};

export default useFullscreenMode;
