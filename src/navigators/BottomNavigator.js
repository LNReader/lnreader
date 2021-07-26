import React from "react";

import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import Library from "../screens/Library/Library";
import Updates from "../screens/Updates/Updates";
import History from "../screens/History/History";
import Browse from "../screens/Browse/Browse";
import More from "../screens/More/More";

import { useSettings, useTheme } from "../hooks/reduxHooks";

const Tab = createMaterialBottomTabNavigator();

const BottomNavigator = () => {
    const theme = useTheme();

    const {
        showHistoryTab = true,
        showUpdatesTab = true,
        showLabelsInNav = false,
    } = useSettings();

    return (
        <Tab.Navigator
            barStyle={{ backgroundColor: theme.colorPrimary }}
            activeColor={theme.colorAccent}
            shifting={!showLabelsInNav}
        >
            <Tab.Screen
                name="Library"
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
            {showUpdatesTab && (
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
            )}
            {showHistoryTab && (
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
            )}
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

export default BottomNavigator;
