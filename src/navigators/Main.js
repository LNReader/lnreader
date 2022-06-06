import React, { useEffect } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { setBarColor } from '../theme/utils/setBarColor';
import { useTheme } from '../hooks/reduxHooks';
import { useGithubUpdateChecker } from '../hooks/githubUpdateChecker';
import * as SplashScreen from 'expo-splash-screen';

/**
 * Navigators
 */
import BottomNavigator from './BottomNavigator';
import MoreStack from './MoreStack';

/**
 * Screens
 */
import Novel from '../screens/novel/NovelScreen';
import Reader from '../screens/reader/ReaderScreen';
import BrowseSourceScreen from '../screens/BrowseSourceScreen/BrowseSourceScreen';
import GlobalSearch from '../screens/browse/globalsearch/GlobalSearch';
import Migration from '../screens/browse/migration/Migration';
import SourceNovels from '../screens/browse/SourceNovels';
import MigrateNovel from '../screens/browse/migration/MigrationNovels';

import MalTopNovels from '../screens/browse/discover/MalTopNovels';
import NewUpdateDialog from '../components/NewUpdateDialog';
import BrowseSettings from '../screens/browse/BrowseSettings';

const Stack = createStackNavigator();

const MainNavigator = () => {
  const theme = useTheme();

  useEffect(() => {
    setTimeout(async () => {
      await SplashScreen.hideAsync();
      setBarColor(theme);
    }, 500);
  }, [theme]);

  const { isNewVersion, latestRelease } = useGithubUpdateChecker() || {};

  return (
    <NavigationContainer
      theme={{ colors: { background: theme.colorPrimaryDark } }}
    >
      {isNewVersion && <NewUpdateDialog newVersion={latestRelease} />}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BottomNavigator" component={BottomNavigator} />
        <Stack.Screen name="Novel" component={Novel} />
        <Stack.Screen name="Chapter" component={Reader} />
        <Stack.Screen name="MoreStack" component={MoreStack} />
        <Stack.Screen name="SourceScreen" component={BrowseSourceScreen} />
        <Stack.Screen name="BrowseMal" component={MalTopNovels} />
        <Stack.Screen name="BrowseSettings" component={BrowseSettings} />
        <Stack.Screen name="GlobalSearch" component={GlobalSearch} />
        <Stack.Screen name="Migration" component={Migration} />
        <Stack.Screen name="SourceNovels" component={SourceNovels} />
        <Stack.Screen name="MigrateNovel" component={MigrateNovel} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
