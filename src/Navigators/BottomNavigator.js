import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../Hooks/useTheme";

import Library from "../screens/Library/Library";
import Updates from "../screens/Updates/Updates";
import History from "../screens/History/History";
import Browse from "../screens/Browse/Browse";
import More from "../screens/More/More";

const Tab = createMaterialBottomTabNavigator();

const BottomNavigator = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            shifting={false}
            barStyle={{ backgroundColor: theme.colorPrimary }}
            activeColor={theme.colorAccentDark}
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

export default BottomNavigator;
