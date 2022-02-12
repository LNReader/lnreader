import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import About from '../screens/MoreScreen/About';
import DownloadQueue from '../screens/MoreScreen/DownloadQueueScreen';
import Downloads from '../screens/MoreScreen/DownloadsScreen';
import SettingsStack from './SettingsStack';

const Stack = createStackNavigator();
const stackNavigatorConfig = {headerShown: false};

const MoreStack = () => (
  <Stack.Navigator screenOptions={stackNavigatorConfig}>
    <Stack.Screen name="SettingsStack" component={SettingsStack} />
    <Stack.Screen name="About" component={About} />
    <Stack.Screen name="DownloadQueue" component={DownloadQueue} />
    <Stack.Screen name="Downloads" component={Downloads} />
  </Stack.Navigator>
);

export default MoreStack;
