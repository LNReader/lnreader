import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import DownloadQueue from '../screens/MoreScreen/DownloadQueueScreen';
import Downloads from '../screens/MoreScreen/DownloadsScreen';
import SettingsStack from './SettingsStack';
import AboutScreen from '../screens/AboutScreen/AboutScreen';

const Stack = createStackNavigator();
const stackNavigatorConfig = {headerShown: false};

const MoreStack = () => (
  <Stack.Navigator screenOptions={stackNavigatorConfig}>
    <Stack.Screen name="SettingsStack" component={SettingsStack} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="DownloadQueue" component={DownloadQueue} />
    <Stack.Screen name="Downloads" component={Downloads} />
  </Stack.Navigator>
);

export default MoreStack;
