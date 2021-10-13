import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

// Screens
import About from '../screens/more/About';
import Settings from '../screens/setting/SettingsScreen';
import TrackerSettings from '../screens/setting/SettingsTrackerScreen';
import ReaderSettings from '../screens/setting/SettingsReaderScreen';
import BackupSettings from '../screens/setting/SettingsBackupScreen';
import AdvancedSettings from '../screens/setting/SettingsAdvancedScreen';
import GeneralSettings from '../screens/setting/SettingsGeneralScreen';
import DownloadQueue from '../screens/more/DownloadQueueScreen';
import Downloads from '../screens/more/DownloadsScreen';
import AppearanceSettings from '../screens/setting/SettingsAppearanceScreen';

const Stack = createStackNavigator();

const stackNavigatorConfig = {headerShown: false};

const SettingsStack = () => (
  <Stack.Navigator screenOptions={stackNavigatorConfig}>
    <Stack.Screen name="Settings" component={Settings} />
    <Stack.Screen name="GeneralSettings" component={GeneralSettings} />
    <Stack.Screen name="ReaderSettings" component={ReaderSettings} />
    <Stack.Screen name="TrackerSettings" component={TrackerSettings} />
    <Stack.Screen name="BackupSettings" component={BackupSettings} />
    <Stack.Screen name="AppearanceSettings" component={AppearanceSettings} />
    <Stack.Screen name="AdvancedSettings" component={AdvancedSettings} />
  </Stack.Navigator>
);

const MoreStack = () => (
  <Stack.Navigator screenOptions={stackNavigatorConfig}>
    <Stack.Screen name="SettingsStack" component={SettingsStack} />
    <Stack.Screen name="About" component={About} />
    <Stack.Screen name="DownloadQueue" component={DownloadQueue} />
    <Stack.Screen name="Downloads" component={Downloads} />
  </Stack.Navigator>
);

export default MoreStack;
