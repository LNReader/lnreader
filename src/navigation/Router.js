import React, { useEffect } from "react";
import {
    createStackNavigator,
    TransitionPresets,
} from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { Provider } from "react-native-paper";
import { setStatusBarStyle } from "expo-status-bar";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import Library from "../screens/Library/Library";
import Updates from "../screens/Updates/Updates";
import History from "../screens/History/History";
import Browse from "../screens/Browse/Browse";

import More from "../screens/More/More";
import About from "../screens/More/About";
import Settings from "../screens/More/Settings";
import Trackers from "../screens/More/Trackers";

import NovelItem from "../screens/Novel/Novel";
import ChapterItem from "../screens/Chapter/Chapter";

import Extension from "../screens/Extension/Extension";

const Stack = createStackNavigator();

const Tab = createMaterialBottomTabNavigator();

const stackNavigatorConfig = {
    headerShown: false,
    ...TransitionPresets.RevealFromBottomAndroid,
};

const SettingsStack = () => {
    return (
        <Stack.Navigator screenOptions={stackNavigatorConfig}>
            <Stack.Screen name="About" component={About} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Trackers" component={Trackers} />
        </Stack.Navigator>
    );
};

import { useSelector } from "react-redux";

const BottomNavigator = () => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <Tab.Navigator
            shifting={false}
            barStyle={{ backgroundColor: theme.colorPrimary }}
            activeColor={theme.colorAccentDark}
        >
            <Tab.Screen
                name="My Library"
                component={Library}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="book-variant-multiple"
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Updates"
                component={Updates}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="alert-decagram-outline"
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="History"
                component={History}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="history"
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Browse"
                component={Browse}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="compass-outline"
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="More"
                component={More}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="dots-horizontal"
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const Router = () => {
    const theme = useSelector((state) => state.themeReducer.theme);

    useEffect(() => setStatusBarStyle(theme.id === 1 ? "dark" : "light"), []);

    return (
        <Provider>
            <Stack.Navigator screenOptions={stackNavigatorConfig}>
                <Stack.Screen name="Router" component={BottomNavigator} />
                <Stack.Screen
                    name="ChapterItem"
                    component={ChapterItem}
                    options={{ ...TransitionPresets.SlideFromRightIOS }}
                />
                <Stack.Screen
                    name="NovelItem"
                    component={NovelItem}
                    options={{
                        headerTitle: "",
                        headerShown: true,
                        headerTransparent: true,
                        headerTintColor: "white",
                    }}
                />
                <Stack.Screen name="SettingsStack" component={SettingsStack} />
                <Stack.Screen name="Extension" component={Extension} />
                {/* <Stack.Screen
                    name="ExtensionStack"
                    component={ExtensionStack}
                /> */}
            </Stack.Navigator>
        </Provider>
    );
};

export default Router;
