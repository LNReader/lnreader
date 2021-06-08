import React from "react";
import {
    createStackNavigator,
    TransitionPresets,
} from "@react-navigation/stack";

import BottomNavigator from "./BottomNavigator";
import Novel from "../Screens/Novel/Novel";
import Chapter from "../Screens/Chapter/Chapter";
import Extension from "../Screens/Extension/Extension";
import GlobalSearch from "../Screens/Browse/globalsearch/GlobalSearch";
import Migration from "../Screens/Browse/migration/Migration";
import SourceNovels from "../Screens/Browse/SourceNovels";
import MigrateNovel from "../Screens/Browse/migration/MigrationNovels";
import MoreStack from "./More";

import { setStatusBarStyle } from "../Hooks/setStatusBarStyle";
import { View } from "react-native";
import { useTheme } from "../Hooks/reduxHooks";
import { githubUpdateChecker } from "../Hooks/githubUpdateChecker";
import NewUpdateDialog from "../Components/NewUpdateDialog";
import { NavigationContainer } from "@react-navigation/native";
import BrowseMalScreen from "../Screens/Browse/BrowseMal";

const Stack = createStackNavigator();

const stackNavigatorConfig = {
    headerShown: false,
};

const MainNavigator = () => {
    const theme = useTheme();
    setStatusBarStyle();
    const { isNewVersion, latestRelease } = githubUpdateChecker() || {};

    return (
        <NavigationContainer
            theme={{ colors: { background: theme.colorPrimaryDark } }}
        >
            <View style={{ flex: 1, backgroundColor: theme.colorPrimaryDark }}>
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
                    <Stack.Screen
                        name="BrowseMal"
                        component={BrowseMalScreen}
                    />

                    <Stack.Screen
                        name="GlobalSearch"
                        component={GlobalSearch}
                    />
                    <Stack.Screen name="Migration" component={Migration} />
                    <Stack.Screen
                        name="SourceNovels"
                        component={SourceNovels}
                    />
                    <Stack.Screen
                        name="MigrateNovel"
                        component={MigrateNovel}
                    />
                </Stack.Navigator>
            </View>
        </NavigationContainer>
    );
};

export default MainNavigator;
