import React, {useEffect} from 'react';
import {View} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {useGithubUpdateChecker} from '../hooks/useAppUpdateChecker';
import * as SplashScreen from 'expo-splash-screen';

/**
 * Navigators
 */
import BottomNavigator from './BottomNavigator';
import MoreStack from './MoreStack';

/**
 * Screens
 */
import NovelScreen from '../screens/NovelScreen/NovelScreen';
import ReaderScreen from '../screens/ReaderScreen/ReaderScreen';
import BrowseSourceScreen from '../screens/BrowseSourceScreen/BrowseSourceScreen';
import SettingsBrowse from '../screens/SettingsScreen/SettingsBrowse/SettingsBrowse';
import GlobalSearchScreen from '../screens/BrowseScreen/GlobalSearchScreen/GlobalSearchScreen';

import NewUpdateDialog from '../components/NewUpdateDialog';

import {setStatusBarColor} from '../theme/utils/setStatusBarColor';
import {useTheme} from '../redux/hooks';

const Stack = createStackNavigator();

const MainNavigator = () => {
  const theme = useTheme();

  useEffect(() => {
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 500);
  });

  useEffect(() => {
    setStatusBarColor(theme);
  }, [theme]);

  const {isNewVersion, latestRelease} = useGithubUpdateChecker() || {};

  return (
    <NavigationContainer theme={{colors: {background: theme.background}}}>
      {isNewVersion && <NewUpdateDialog newVersion={latestRelease} />}
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="BottomNavigator" component={BottomNavigator} />
        <Stack.Screen name="NovelScreen" component={NovelScreen} />
        <Stack.Screen name="ReaderScreen" component={ReaderScreen} />
        <Stack.Screen name="MoreStack" component={MoreStack} />
        <Stack.Screen
          name="BrowseSourceScreen"
          component={BrowseSourceScreen}
        />
        <Stack.Screen name="SettingsBrowse" component={SettingsBrowse} />
        <Stack.Screen name="GlobalSearch" component={GlobalSearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
