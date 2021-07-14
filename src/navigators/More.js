import React from "react";

import { createStackNavigator } from "@react-navigation/stack";

// Screens
import About from "../screens/More/About";
import Settings from "../screens/More/Settings";
import TrackerSettings from "../screens/More/TrackerSettings";
import ReaderSettings from "../screens/More/ReaderSettings";
import BackupSettings from "../screens/More/BackupSettings";
import AdvancedSettings from "../screens/More/AdvancedSettings";
import GeneralSettings from "../screens/More/GeneralSettings";
import DownloadQueue from "../screens/More/DownloadQueue";

const Stack = createStackNavigator();

const stackNavigatorConfig = { headerShown: false };

const SettingsStack = () => (
    <Stack.Navigator screenOptions={stackNavigatorConfig}>
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="GeneralSettings" component={GeneralSettings} />
        <Stack.Screen name="ReaderSettings" component={ReaderSettings} />
        <Stack.Screen name="TrackerSettings" component={TrackerSettings} />
        <Stack.Screen name="BackupSettings" component={BackupSettings} />
        <Stack.Screen name="AdvancedSettings" component={AdvancedSettings} />
    </Stack.Navigator>
);

const MoreStack = () => (
    <Stack.Navigator screenOptions={stackNavigatorConfig}>
        <Stack.Screen name="SettingsStack" component={SettingsStack} />
        <Stack.Screen name="About" component={About} />
        <Stack.Screen name="DownloadQueue" component={DownloadQueue} />
    </Stack.Navigator>
);

export default MoreStack;
