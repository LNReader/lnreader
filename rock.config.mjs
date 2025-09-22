// @ts-check
// import { platformIOS } from '@rock-js/platform-ios';
import { platformAndroid } from '@rock-js/platform-android';
import { pluginMetro } from '@rock-js/plugin-metro';

/** @type {import('rock').Config} */
export default {
  bundler: pluginMetro(),
  platforms: {
    // ios: platformIOS(),
    android: platformAndroid(),
  },
  remoteCacheProvider: null,
};
