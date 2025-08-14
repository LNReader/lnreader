import { useCallback, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  useChapterGeneralSettings,
  useChapterReaderSettings,
  useTheme,
} from '../persisted';
import Color from 'color';
import * as NavigationBar from 'expo-navigation-bar';
import {
  changeNavigationBarColor,
  setStatusBarColor,
} from '@theme/utils/setBarColor';
import { SystemBars } from 'react-native-edge-to-edge';

const useFullscreenMode = () => {
  const { addListener } = useNavigation();
  const { theme: backgroundColor } = useChapterReaderSettings();
  const { fullScreenMode } = useChapterGeneralSettings();
  const theme = useTheme();

  const setImmersiveMode = useCallback(() => {
    if (fullScreenMode) {
      StatusBar.setHidden(true);
      SystemBars.setHidden(true);
    } else {
      setStatusBarColor(Color(backgroundColor));
      changeNavigationBarColor(
        backgroundColor,
        Color(backgroundColor).isDark(),
      );
    }
  }, [backgroundColor, fullScreenMode]);

  const showStatusAndNavBar = useCallback(() => {
    StatusBar.setHidden(false);
    SystemBars.setHidden(false);

    if (fullScreenMode) {
      /**
       * This is overlay of reader footer and should be transparent.
       * But in hexa, ##xxxxxx00 could be another color
       */
      changeNavigationBarColor(
        Color(theme.surface).alpha(0.01).hexa(),
        theme.isDark,
      );
      setStatusBarColor(theme);
    } else {
      changeNavigationBarColor(
        backgroundColor,
        Color(backgroundColor).isDark(),
      );
    }
  }, [backgroundColor, fullScreenMode, theme]);

  useEffect(() => {
    setImmersiveMode();
    return () => {
      StatusBar.setHidden(false);
      SystemBars.setHidden(false);
    };
  }, [setImmersiveMode]);

  useEffect(() => {
    const unsubscribe = addListener('beforeRemove', () => {
      StatusBar.setHidden(false);
      NavigationBar.setVisibilityAsync('visible');
      setStatusBarColor(theme);
      changeNavigationBarColor(Color(theme.surface2).hex(), theme.isDark);
    });

    return unsubscribe;
  }, [addListener, theme]);

  return { setImmersiveMode, showStatusAndNavBar };
};

export default useFullscreenMode;
