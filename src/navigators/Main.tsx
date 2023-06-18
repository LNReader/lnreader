import React, { useEffect } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { setBarColor } from '../theme/utils/setBarColor';
import { useTheme } from '../hooks/useTheme';
import { useGithubUpdateChecker } from '../hooks/githubUpdateChecker';

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
import NewUpdateDialog from '../components/NewUpdateDialog';
import BrowseSettings from '../screens/browse/BrowseSettings';
import { useAppDispatch } from '@redux/hooks';
import { updateLibraryAction } from '@redux/updates/updates.actions';
import { useSettings } from '@hooks/reduxHooks';
import WebviewScreen from '@screens/WebviewScreen/WebviewScreen';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { updateLibraryOnLaunch = false } = useSettings();

  useEffect(() => {
    const timer = setTimeout(async () => {
      setBarColor(theme);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [theme.id]);

  useEffect(() => {
    if (updateLibraryOnLaunch) {
      dispatch(updateLibraryAction());
    }
  }, []);

  const { isNewVersion, latestRelease } = useGithubUpdateChecker();

  return (
    <NavigationContainer theme={{ colors: theme }}>
      {isNewVersion && <NewUpdateDialog newVersion={latestRelease} />}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BottomNavigator" component={BottomNavigator} />
        <Stack.Screen name="Novel" component={Novel} />
        <Stack.Screen name="Chapter" component={Reader} />
        <Stack.Screen name="MoreStack" component={MoreStack} />
        <Stack.Screen name="SourceScreen" component={BrowseSourceScreen} />
        <Stack.Screen name="BrowseMal" component={MalTopNovels} />
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
