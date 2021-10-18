import {NativeModules, Platform} from 'react-native';

const {NavigationBarColor} = NativeModules;

const changeNavigationBarColor = (
  color = String,
  light = false,
  animated = true,
) => {
  if (Platform.OS === 'android') {
    const LightNav = light ? true : false;
    NavigationBarColor.changeNavigationBarColor(color, LightNav, animated);
  }
};
const hideNavigationBar = () => {
  if (Platform.OS === 'android') {
    return NavigationBarColor.hideNavigationBar();
  } else {
    return false;
  }
};
const showNavigationBar = () => {
  if (Platform.OS === 'android') {
    NavigationBarColor.showNavigationBar();
  } else {
    return false;
  }
};

export {changeNavigationBarColor, hideNavigationBar, showNavigationBar};
