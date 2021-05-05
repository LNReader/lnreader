import React from "react";
import {
    createStackNavigator,
    TransitionPresets,
} from "@react-navigation/stack";

import BottomNavigator from "./BottomNavigator";
import Novel from "../Screens/Novel/Novel";
import Chapter from "../Screens/Chapter/Chapter";
import Extension from "../Screens/Extension/Extension";
import GlobalSearch from "../Screens/Browse/GlobalSearch";
import MoreStack from "./More";

import { setStatusBarStyle } from "../Hooks/setStatusBarStyle";
import { View } from "react-native";
import { useTheme } from "../Hooks/reduxHooks";
import { githubUpdateChecker } from "../Hooks/githubUpdateChecker";
import NewUpdateDialog from "../Components/NewUpdateDialog";

const Stack = createStackNavigator();

const stackNavigatorConfig = {
    headerShown: false,
};

const MainNavigator = () => {
    const theme = useTheme();
    setStatusBarStyle();
    const { isNewVersion, latestRelease } = githubUpdateChecker() || {};

    return (
        <View style={{ flex: 1, backgroundColor: theme.colorPrimary }}>
            {isNewVersion && <NewUpdateDialog newVersion={latestRelease} />}
            <Stack.Navigator screenOptions={stackNavigatorConfig}>
                <Stack.Screen
                    name="BottomNavigator"
                    component={BottomNavigator}
                />
                <Stack.Screen
                    name="Novel"
                    component={Novel}
                    options={{
                        headerTitle: "",
                        headerShown: true,
                        headerTransparent: true,
                        headerTintColor: "white",
                        ...TransitionPresets.RevealFromBottomAndroid,
                    }}
                />
                <Stack.Screen
                    name="Chapter"
                    component={Chapter}
                    options={{ ...TransitionPresets.SlideFromRightIOS }}
                />
                <Stack.Screen name="MoreStack" component={MoreStack} />
                <Stack.Screen name="Extension" component={Extension} />
                <Stack.Screen name="GlobalSearch" component={GlobalSearch} />
            </Stack.Navigator>
        </View>
    );
};

export default MainNavigator;
