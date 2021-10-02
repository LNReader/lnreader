import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

// Screens
import About from '../screens/more/About';
import Settings from '../screens/setting/Settings';
import TrackerSettings from '../screens/setting/SettingsTracker';
import ReaderSettings from '../screens/setting/SettingsReader';
import BackupSettings from '../screens/setting/SettingsBackup';
import AdvancedSettings from '../screens/setting/SettingsAdvanced';
import GeneralSettings from '../screens/setting/SettingsGeneral';
import DownloadQueue from '../screens/more/DownloadQueue';
import Downloads from '../screens/more/Downloads';
import AppearanceSettings from '../screens/setting/SettingsAppearance';

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
