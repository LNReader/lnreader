import { useCallback, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import color from 'color';
import {
  useChapterGeneralSettings,
  useChapterReaderSettings,
  useTheme,
} from '../persisted';
import Color from 'color';
import * as NavigationBar from 'expo-navigation-bar';

export const changeNavigationBarColor = (color: string, isDark = false) => {
  NavigationBar.setBackgroundColorAsync(color);
  NavigationBar.setButtonStyleAsync(isDark ? 'dark' : 'light');
};

const useFullscreenMode = () => {
  const { addListener } = useNavigation();
  const { theme: backgroundColor } = useChapterReaderSettings();
  const { fullScreenMode } = useChapterGeneralSettings();
  const theme = useTheme();

  const setImmersiveMode = useCallback(() => {
    if (fullScreenMode) {
      StatusBar.setHidden(true);
      NavigationBar.setVisibilityAsync('hidden');
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
    NavigationBar.setVisibilityAsync('visible');

    /**
     * This is overlay of reader footer and should be transparent.
     * But in hexa, ##xxxxxx00 could be another color
     */
    changeNavigationBarColor(
      Color(theme.surface).alpha(0.05).hexa(),
      !theme.isDark,
    );
  }, []);

  useEffect(() => {
    setImmersiveMode();
  }, [setImmersiveMode]);

  useEffect(() => {
    const unsubscribe = addListener('beforeRemove', () => {
      showStatusAndNavBar();
      StatusBar.setBarStyle(theme.isDark ? 'light-content' : 'dark-content');
      changeNavigationBarColor(Color(theme.surface2).hex(), !theme.isDark);
    });

    return unsubscribe;
  }, []);

  return { setImmersiveMode, showStatusAndNavBar };
};

export default useFullscreenMode;
