import React from "react";
import { View } from "react-native";
import { useTheme } from "../Hooks/reduxHooks";

import { createStackNavigator } from "@react-navigation/stack";

import About from "../Screens/More/About";
import Settings from "../Screens/More/Settings";
import TrackerSettings from "../Screens/More/TrackerSettings";
import ReaderSettings from "../Screens/More/ReaderSettings";
import BackupSettings from "../Screens/More/BackupSettings";
import AdvancedSettings from "../Screens/More/AdvancedSettings";
import GeneralSettings from "../Screens/More/GeneralSettings";

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
            </Stack.Navigator>
        </View>
    );
};

export default MoreStack;
