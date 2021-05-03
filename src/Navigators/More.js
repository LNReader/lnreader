import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import About from "../Screens/More/About";
import Settings from "../Screens/More/Settings";
import Trackers from "../Screens/More/Trackers";
import { View } from "react-native";
import { useTheme } from "../Hooks/useTheme";

const Stack = createStackNavigator();

const stackNavigatorConfig = { headerShown: false };

const MoreStack = () => {
    const theme = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.colorPrimary }}>
            <Stack.Navigator screenOptions={stackNavigatorConfig}>
                <Stack.Screen name="Settings" component={Settings} />
                <Stack.Screen name="Trackers" component={Trackers} />
                <Stack.Screen name="About" component={About} />
            </Stack.Navigator>
        </View>
    );
};

export default MoreStack;
