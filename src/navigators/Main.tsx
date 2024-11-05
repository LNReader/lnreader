import React, { useEffect } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';

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
const MoreStack = React.lazy(() => import('./MoreStack'));

/**
 * Screens
 */
const Novel = React.lazy(() => import('../screens/novel/NovelScreen'));
const Reader = React.lazy(() => import('../screens/reader/ReaderScreen'));
const BrowseSourceScreen = React.lazy(
  () => import('../screens/BrowseSourceScreen/BrowseSourceScreen'),
);
const GlobalSearchScreen = React.lazy(
  () => import('../screens/GlobalSearchScreen/GlobalSearchScreen'),
);
const Migration = React.lazy(
  () => import('../screens/browse/migration/Migration'),
);
const SourceNovels = React.lazy(() => import('../screens/browse/SourceNovels'));
const MigrateNovel = React.lazy(
  () => import('../screens/browse/migration/MigrationNovels'),
);

const MalTopNovels = React.lazy(
  () => import('../screens/browse/discover/MalTopNovels'),
);
const AniListTopNovels = React.lazy(
  () => import('../screens/browse/discover/AniListTopNovels'),
);
const NewUpdateDialog = React.lazy(
  () => import('../components/NewUpdateDialog'),
);
const BrowseSettings = React.lazy(
  () => import('../screens/browse/settings/BrowseSettings'),
);
const WebviewScreen = React.lazy(
  () => import('@screens/WebviewScreen/WebviewScreen'),
);
import { RootStackParamList } from './types';
import Color from 'color';
import { useMMKVBoolean } from 'react-native-mmkv';
import OnboardingScreen from '@screens/onboarding/OnboardingScreen';
import {
  createRepository,
  isRepoUrlDuplicate,
} from '@database/queries/RepositoryQueries';
import { showToast } from '@utils/showToast';
import ServiceManager from '@services/ServiceManager';
const Stack = createStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  const url = Linking.useURL();
  const theme = useTheme();
  const { updateLibraryOnLaunch } = useAppSettings();
  const { refreshPlugins } = usePlugins();
  const [isOnboarded] = useMMKVBoolean('IS_ONBOARDED');

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
      ServiceManager.manager.addTask({ name: 'UPDATE_LIBRARY' });
    }
    if (isOnboarded) {
      // hack this helps app has enough time to initialize database;
      refreshPlugins();
    }
  }, [isOnboarded]);

  useEffect(() => {
    if (url) {
      const { hostname, path, queryParams } = Linking.parse(url);
      if (hostname === 'repo' && path === 'add') {
        const repoUrl = queryParams?.url;
        if (typeof repoUrl === 'string') {
          isRepoUrlDuplicate(repoUrl).then(isDuplicated => {
            if (isDuplicated) {
              showToast('A respository with this url already exists!');
            } else {
              createRepository(repoUrl);
            }
          });
        }
      }
    }
  }, [url]);

  const { isNewVersion, latestRelease } = useGithubUpdateChecker();

  if (!isOnboarded) {
    return <OnboardingScreen />;
  }

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
