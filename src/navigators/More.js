import React from "react";
import { View } from "react-native";
import { useTheme } from "../hooks/reduxHooks";

import { createStackNavigator } from "@react-navigation/stack";

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

const SettingsStack = () => {
    const theme = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.colorPrimaryDark }}>
            <Stack.Navigator screenOptions={stackNavigatorConfig}>
                <Stack.Screen name="Settings" component={Settings} />
                <Stack.Screen
                    name="GeneralSettings"
                    component={GeneralSettings}
                />
                <Stack.Screen
                    name="ReaderSettings"
                    component={ReaderSettings}
                />
                <Stack.Screen
                    name="TrackerSettings"
                    component={TrackerSettings}
                />
                <Stack.Screen
                    name="BackupSettings"
                    component={BackupSettings}
                />
                <Stack.Screen
                    name="AdvancedSettings"
                    component={AdvancedSettings}
                />
            </Stack.Navigator>
        </View>
    );
};

const MoreStack = () => {
    const theme = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.colorPrimaryDark }}>
            <Stack.Navigator screenOptions={stackNavigatorConfig}>
                <Stack.Screen name="SettingsStack" component={SettingsStack} />
                <Stack.Screen name="About" component={About} />
                <Stack.Screen name="DownloadQueue" component={DownloadQueue} />
            </Stack.Navigator>
        </View>
    );
};

export default MoreStack;
