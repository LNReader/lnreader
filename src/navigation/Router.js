import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { theme } from "../theming/theme";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import Library from "../screens/Library";
import Updates from "../screens/Updates";
import Latest from "../screens/Latest";
import More from "../screens/More";
import Search from "../screens/Search";
import NovelItem from "../screens/NovelItem";
import ChapterItem from "../screens/ChapterItem";
import About from "../screens/About";

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
            <Stack.Screen
                name="Library"
                component={Library}
                options={{ headerShown: false }}
            />
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
        <Stack.Navigator
            screenOptions={{
                headerTintColor: theme.textColorPrimaryDark,
                headerStyle: { backgroundColor: theme.colorDarkPrimary },
            }}
        >
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

const UpdatesStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: theme.textColorPrimaryDark,
                headerStyle: { backgroundColor: theme.colorDarkPrimary },
            }}
        >
            <Stack.Screen name="Updates" component={Updates} />
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

const Router = () => {
    return (
        <Tab.Navigator
            shifting={false}
            barStyle={{ backgroundColor: theme.colorDarkPrimary }}
            activeColor="#3399FF"
        >
            <Tab.Screen
                name="All Novels"
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
            <Tab.Screen
                name="Updates"
                component={UpdatesStack}
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
                name="Search"
                component={SearchStack}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="magnify"
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Latest"
                component={LatestStack}
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
        </Stack.Navigator>
    );
};

export default MainStack;
