import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Settings from '../screens/SettingsScreen/SettingsScreen';
import TrackerSettings from '../screens/SettingsScreen/SettingsTrackerScreen';
import ReaderSettings from '../screens/SettingsScreen/SettingsReaderScreen';
import BackupSettings from '../screens/SettingsScreen/SettingsBackupScreen';
import AdvancedSettings from '../screens/SettingsScreen/SettingsAdvancedScreen';
import GeneralSettings from '../screens/SettingsScreen/SettingsGeneralScreen';
import AppearanceSettings from '../screens/SettingsScreen/SettingsAppearanceScreen';

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

export default SettingsStack;
