import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import About from '../screens/more/About';
import Settings from '../screens/settings/SettingsScreen';
import TrackerSettings from '../screens/settings/SettingsTrackerScreen';
import ReaderSettings from '../screens/settings/SettingsReaderScreen/SettingsReaderScreen';
import BackupSettings from '../screens/settings/SettingsBackupScreen';
import AdvancedSettings from '../screens/settings/SettingsAdvancedScreen';
import GeneralSettings from '../screens/settings/SettingsGeneralScreen/SettingsGeneralScreen';
import TaskQueue from '../screens/more/TaskQueueScreen';
import Downloads from '../screens/more/DownloadsScreen';
import AppearanceSettings from '../screens/settings/SettingsAppearanceScreen';
import CategoriesScreen from '@screens/Categories/CategoriesScreen';
import RespositorySettings from '@screens/settings/SettingsRepositoryScreen/SettingsRepositoryScreen';
import TranslationSettings from '@screens/settings/SettingsTranslationScreen';
import TranslationListScreen from '@screens/settings/TranslationListScreen';
// import LibrarySettings from '@screens/settings/SettingsLibraryScreen/SettingsLibraryScreen';
import StatsScreen from '@screens/StatsScreen/StatsScreen';
import { MoreStackParamList, SettingsStackParamList } from './types/index';

const Stack = createStackNavigator<
  MoreStackParamList & SettingsStackParamList
>();

const stackNavigatorConfig = { headerShown: false };

const SettingsStack = () => (
  <Stack.Navigator screenOptions={stackNavigatorConfig}>
    <Stack.Screen name="Settings" component={Settings} />
    <Stack.Screen name="GeneralSettings" component={GeneralSettings} />
    <Stack.Screen name="ReaderSettings" component={ReaderSettings} />
    <Stack.Screen name="TrackerSettings" component={TrackerSettings} />
    <Stack.Screen name="BackupSettings" component={BackupSettings} />
    <Stack.Screen name="AppearanceSettings" component={AppearanceSettings} />
    <Stack.Screen name="AdvancedSettings" component={AdvancedSettings} />
    <Stack.Screen name="RespositorySettings" component={RespositorySettings} />
    <Stack.Screen name="TranslationSettings" component={TranslationSettings} />
    <Stack.Screen name="TranslationList" component={TranslationListScreen} />
    {/* <Stack.Screen name="LibrarySettings" component={LibrarySettings} /> */}
  </Stack.Navigator>
);

const MoreStack = () => (
  <Stack.Navigator screenOptions={stackNavigatorConfig}>
    <Stack.Screen name="SettingsStack" component={SettingsStack} />
    <Stack.Screen name="About" component={About} />
    <Stack.Screen name="TaskQueue" component={TaskQueue} />
    <Stack.Screen name="Downloads" component={Downloads} />
    <Stack.Screen name="Categories" component={CategoriesScreen} />
    <Stack.Screen name="Statistics" component={StatsScreen} />
  </Stack.Navigator>
);

export default MoreStack;
