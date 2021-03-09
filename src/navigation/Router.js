import React from "react";

import {
    createStackNavigator,
    TransitionPresets,
} from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import Library from "../screens/Library";
import History from "../screens/History/History";
import Browse from "../screens/Browse";

import More from "../screens/More/More";
import About from "../screens/More/About";
import Settings from "../screens/More/Settings";

import NovelItem from "../screens/NovelItem";
import ChapterItem from "../screens/ChapterItem";

// Sources
import BoxNovel from "../screens/Sources/boxnovel/BoxNovel";
import ReadLightNovel from "../screens/Sources/readlightnovel/ReadLightNovel";

const Stack = createStackNavigator();

const Tab = createMaterialBottomTabNavigator();

const stackNavigatorConfig = {
    headerShown: false,
    ...TransitionPresets.RevealFromBottomAndroid,
};

const MoreStack = () => {
    return (
        <Stack.Navigator screenOptions={stackNavigatorConfig}>
            <Stack.Screen name="More" component={More} />
            <Stack.Screen name="About" component={About} />
            <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
    );
};

const BoxNovelStack = () => {
    return (
        <Stack.Navigator screenOptions={stackNavigatorConfig}>
            <Stack.Screen name="BoxNovel" component={BoxNovel} />
        </Stack.Navigator>
    );
};

const ReadLightNovelStack = () => {
    return (
        <Stack.Navigator screenOptions={stackNavigatorConfig}>
            <Stack.Screen name="ReadLightNovel" component={ReadLightNovel} />
        </Stack.Navigator>
    );
};

import { useSelector } from "react-redux";

const BottomNavigator = () => {
    const theme = useSelector((state) => state.themeReducer.theme);
    return (
        <Tab.Navigator
            shifting={false}
            barStyle={{ backgroundColor: theme.colorDarkPrimary }}
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
            {/* 
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
            /> */}
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
                component={MoreStack}
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
    return (
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
            <Stack.Screen name="BoxNovelStack" component={BoxNovelStack} />
            <Stack.Screen
                name="ReadLightNovelStack"
                component={ReadLightNovelStack}
            />
        </Stack.Navigator>
    );
};

export default Router;
