import React from "react";
import {
    createStackNavigator,
    TransitionPresets,
} from "@react-navigation/stack";

import About from "../screens/More/About";
import Settings from "../screens/More/Settings";
import Trackers from "../screens/More/Trackers";

const Stack = createStackNavigator();

const stackNavigatorConfig = {
    headerShown: false,
    ...TransitionPresets.RevealFromBottomAndroid,
};

const MoreStack = () => {
    return (
        <Stack.Navigator screenOptions={stackNavigatorConfig}>
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Trackers" component={Trackers} />
            <Stack.Screen name="About" component={About} />
        </Stack.Navigator>
    );
};

export default MoreStack;
