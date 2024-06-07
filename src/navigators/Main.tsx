import React, { useEffect } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import {
  changeNavigationBarColor,
  setStatusBarColor,
} from '@theme/utils/setBarColor';
import { useAppSettings, usePlugins, useTheme } from '@hooks/persisted';
import { useGithubUpdateChecker } from '@hooks/common/githubUpdateChecker';

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
import GlobalSearchScreen from '../screens/GlobalSearchScreen/GlobalSearchScreen';
import Migration from '../screens/browse/migration/Migration';
import SourceNovels from '../screens/browse/SourceNovels';
import MigrateNovel from '../screens/browse/migration/MigrationNovels';

import MalTopNovels from '../screens/browse/discover/MalTopNovels';
import AniListTopNovels from '../screens/browse/discover/AniListTopNovels';
import NewUpdateDialog from '../components/NewUpdateDialog';
import BrowseSettings from '../screens/browse/BrowseSettings';
import { updateLibrary } from '@services/updates';
import WebviewScreen from '@screens/WebviewScreen/WebviewScreen';
import { RootStackParamList } from './types';
import Color from 'color';

const Stack = createStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  const theme = useTheme();
  const { updateLibraryOnLaunch } = useAppSettings();
  const { refreshPlugins } = usePlugins();

  useEffect(() => {
    const timer = setTimeout(async () => {
      setStatusBarColor(theme);
      changeNavigationBarColor(Color(theme.surface2).hex(), theme.isDark);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [theme]);

  useEffect(() => {
    if (updateLibraryOnLaunch) {
      updateLibrary();
    }
    refreshPlugins();
  }, []);

  const { isNewVersion, latestRelease } = useGithubUpdateChecker();

  return (
    <NavigationContainer theme={{ colors: theme, dark: theme.isDark }}>
      {isNewVersion && <NewUpdateDialog newVersion={latestRelease} />}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BottomNavigator" component={BottomNavigator} />
        <Stack.Screen name="Novel" component={Novel} />
        <Stack.Screen name="Chapter" component={Reader} />
        <Stack.Screen name="MoreStack" component={MoreStack} />
        <Stack.Screen name="SourceScreen" component={BrowseSourceScreen} />
        <Stack.Screen name="BrowseMal" component={MalTopNovels} />
        <Stack.Screen name="BrowseAL" component={AniListTopNovels} />
        <Stack.Screen name="BrowseSettings" component={BrowseSettings} />
        <Stack.Screen
          name="GlobalSearchScreen"
          component={GlobalSearchScreen}
        />
        <Stack.Screen name="Migration" component={Migration} />
        <Stack.Screen name="SourceNovels" component={SourceNovels} />
        <Stack.Screen name="MigrateNovel" component={MigrateNovel} />
        <Stack.Screen name="WebviewScreen" component={WebviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
