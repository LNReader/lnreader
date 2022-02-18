import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {useReaderSettings, useTheme} from '../../../redux/hooks';
import {
  changeNavigationBarColor,
  hideNavigationBar,
  showNavigationBar,
} from '../../../theme/NativeModules/NavigationBarColor';

const useFullscreenMode = () => {
  const {addListener} = useNavigation();
  const {backgroundColor, fullScreenMode} = useReaderSettings();
  const theme = useTheme();

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
      StatusBar.setBarStyle(
        theme.type === 'light' ? 'dark-content' : 'light-content',
      );
    });

    return unsubscribe;
  }, []);

  return {setImmersiveMode, showStatusAndNavBar};
};

export default useFullscreenMode;
