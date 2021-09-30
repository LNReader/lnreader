import React, {useEffect} from 'react';
import {View} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {setBarColor} from '../theme/utils/setBarColor';
import {useTheme} from '../hooks/reduxHooks';
import {githubUpdateChecker} from '../hooks/githubUpdateChecker';
import * as SplashScreen from 'expo-splash-screen';

// Navigators
import BottomNavigator from './BottomNavigator';

// Screens
import Novel from '../screens/Novel/Novel';
import Chapter from '../screens/Chapter/Chapter';
import Extension from '../screens/Extension/Extension';
import GlobalSearch from '../screens/Browse/globalsearch/GlobalSearch';
import Migration from '../screens/Browse/migration/Migration';
import SourceNovels from '../screens/Browse/SourceNovels';
import MigrateNovel from '../screens/Browse/migration/MigrationNovels';
import MoreStack from './More';
import MalTopNovels from '../screens/Browse/discover/MalTopNovels';
import NewUpdateDialog from '../components/NewUpdateDialog';
import BrowseSettings from '../screens/Browse/BrowseSettings';

const Stack = createStackNavigator();

const MainNavigator = () => {
  const theme = useTheme();

  useEffect(() => {
    setTimeout(async () => {
      await SplashScreen.hideAsync();
      setBarColor(theme);
    }, 500);
  }, [theme]);

  const {isNewVersion, latestRelease} = githubUpdateChecker() || {};

  return (
    <NavigationContainer theme={{colors: {background: theme.colorPrimaryDark}}}>
      <View style={{flex: 1, backgroundColor: theme.colorPrimaryDark}}>
        {isNewVersion && <NewUpdateDialog newVersion={latestRelease} />}
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="BottomNavigator" component={BottomNavigator} />
          <Stack.Screen name="Novel" component={Novel} />
          <Stack.Screen name="Chapter" component={Chapter} />
          <Stack.Screen name="MoreStack" component={MoreStack} />
          <Stack.Screen name="Extension" component={Extension} />
          <Stack.Screen name="BrowseMal" component={MalTopNovels} />
          <Stack.Screen name="BrowseSettings" component={BrowseSettings} />
          <Stack.Screen name="GlobalSearch" component={GlobalSearch} />
          <Stack.Screen name="Migration" component={Migration} />
          <Stack.Screen name="SourceNovels" component={SourceNovels} />
          <Stack.Screen name="MigrateNovel" component={MigrateNovel} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
};

export default MainNavigator;
