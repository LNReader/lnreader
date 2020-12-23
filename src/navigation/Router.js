import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import Library from "../screens/Library";
import Updates from "../screens/Updates";
import Browse from "../screens/Browse";
import More from "../screens/More";
import Search from "../screens/Search";
import NovelItem from "../screens/NovelItem";

import { CardStyleInterpolators } from "@react-navigation/stack";

const Stack = createStackNavigator();

const Tab = createMaterialBottomTabNavigator();

const LibraryStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: "white",
                headerStyle: { backgroundColor: "#242529" },
            }}
        >
            <Stack.Screen name="Library" component={Library} />
        </Stack.Navigator>
    );
};

const BrowseStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: "white",
                headerStyle: { backgroundColor: "#242529" },
            }}
        >
            <Stack.Screen name="Browse" component={Browse} />
            <Stack.Screen
                name="NovelItem"
                component={NovelItem}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    );
};

const SearchStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: "white",
                headerStyle: { backgroundColor: "#242529" },
            }}
        >
            <Stack.Screen
                name="Search"
                component={Search}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="NovelItem"
                component={NovelItem}
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
                headerTintColor: "white",
                headerStyle: { backgroundColor: "#242529" },
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
                headerTintColor: "white",
                headerStyle: { backgroundColor: "#242529" },
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
            barStyle={{ backgroundColor: "#242529" }}
            activeColor="#3399FF"
        >
            <Tab.Screen
                name="Library"
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
export default Router;
