import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { TransitionPresets } from "@react-navigation/stack";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import Library from "../screens/Library";
import Browse from "../screens/Browse";
import Latest from "../screens/Latest";
import More from "../screens/More";
import BoxNovelSearch from "../screens/Search";
import NovelItem from "../screens/NovelItem";
import ChapterItem from "../screens/ChapterItem";
import About from "../screens/About";
import BoxNovel from "../screens/Sources/BoxNovel";
import { theme } from "../theming/theme";

const Stack = createStackNavigator();

const Tab = createMaterialBottomTabNavigator();

const LibraryStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: theme.textColorPrimaryDark,
                headerStyle: { backgroundColor: theme.colorDarkPrimary },
            }}
        >
            <Stack.Screen name="Library" component={Library} />
        </Stack.Navigator>
    );
};

const LatestStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: theme.textColorPrimaryDark,
                headerStyle: { backgroundColor: theme.colorDarkPrimary },
            }}
        >
            <Stack.Screen name="Latest" component={Latest} />
        </Stack.Navigator>
    );
};

const SearchStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Search"
                component={Search}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    );
};

const BrowseStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: theme.textColorPrimaryDark,
                headerStyle: { backgroundColor: theme.colorDarkPrimary },
            }}
        >
            <Stack.Screen
                name="Browse"
                component={Browse}
                // options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};
const MoreStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: theme.textColorPrimaryDark,
                headerStyle: { backgroundColor: theme.colorDarkPrimary },
            }}
        >
            <Stack.Screen name="More" component={More} />
        </Stack.Navigator>
    );
};

const BoxNovelStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                // headerTintColor: theme.textColorPrimaryDark,
                // headerStyle: { backgroundColor: theme.colorDarkPrimary },
                headerShown: false,
            }}
        >
            <Stack.Screen name="BoxNovel" component={BoxNovel} />
            <Stack.Screen name="BoxNovelSearch" component={BoxNovelSearch} />
            {/* <Stack.Screen name="WuxiaWorld" component={WuxiaWorld} /> */}
        </Stack.Navigator>
    );
};

const Router = () => {
    return (
        <Tab.Navigator
            shifting={false}
            barStyle={{ backgroundColor: theme.colorDarkPrimary }}
            activeColor="#3399FF"
        >
            <Tab.Screen
                name="My Library"
                component={LibraryStack}
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

            {/* <Tab.Screen
                name="Latest"
                component={LatestStack}
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
            {/* <Tab.Screen
                name="Search"
                component={SearchStack}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="book-search"
                            color={color}
                            size={24}
                        />
                    ),
                }}
            /> */}
            <Tab.Screen
                name="Browse"
                component={BrowseStack}
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

const MainStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                ...TransitionPresets.RevealFromBottomAndroid,
            }}
        >
            <Stack.Screen name="MainStack" component={Router} />
            <Stack.Screen name="ChapterItem" component={ChapterItem} />
            <Stack.Screen name="NovelItem" component={NovelItem} />
            <Stack.Screen
                name="About"
                component={About}
                options={{
                    headerShown: true,
                    headerTintColor: theme.textColorPrimaryDark,
                    headerStyle: { backgroundColor: theme.colorDarkPrimary },
                }}
            />
            <Stack.Screen name="BoxNovelStack" component={BoxNovelStack} />
        </Stack.Navigator>
    );
};

export default MainStack;
