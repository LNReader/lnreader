import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Settings from '../screens/SettingsScreen/SettingsScreen';
import TrackerSettings from '../screens/SettingsScreen/SettingsTrackerScreen';
import ReaderSettings from '../screens/SettingsScreen/SettingsReader/SettingsReader';
import BackupSettings from '../screens/SettingsScreen/SettingsBackupScreen';
import SettingsAdvanced from '../screens/SettingsScreen/SettingsAdvanced/SettingsAdvanced';
import GeneralSettings from '../screens/SettingsScreen/SettingsGeneral/SettingsGeneral';
import SettingsAppearance from '../screens/SettingsScreen/SettingsAppearance/SettingsAppearance';

const Stack = createStackNavigator();

const stackNavigatorConfig = {headerShown: false};

const SettingsStack = () => (
  <Stack.Navigator screenOptions={stackNavigatorConfig}>
    <Stack.Screen name="Settings" component={Settings} />
    <Stack.Screen name="GeneralSettings" component={GeneralSettings} />
    <Stack.Screen name="ReaderSettings" component={ReaderSettings} />
    <Stack.Screen name="TrackerSettings" component={TrackerSettings} />
    <Stack.Screen name="BackupSettings" component={BackupSettings} />
    <Stack.Screen name="SettingsAppearance" component={SettingsAppearance} />
    <Stack.Screen name="SettingsAdvanced" component={SettingsAdvanced} />
  </Stack.Navigator>
);

export default SettingsStack;
