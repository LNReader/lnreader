import React, { useEffect, useState } from "react";
import {
    createStackNavigator,
    TransitionPresets,
} from "@react-navigation/stack";

import BottomNavigator from "./BottomNavigator";
import Novel from "../screens/Novel/Novel";
import Chapter from "../screens/Chapter/Chapter";
import Extension from "../screens/Extension/Extension";
import MoreStack from "./More";

import { setStatusBarStyle } from "../Hooks/setStatusBarStyle";
import { checkGithubRelease } from "../Services/updates";

const Stack = createStackNavigator();

const stackNavigatorConfig = {
    headerShown: false,
    ...TransitionPresets.RevealFromBottomAndroid,
};

const MainNavigator = () => {
    const [newUpdate, setNewUpdate] = useState();
    setStatusBarStyle();

    useEffect(() => {
        checkGithubRelease().then((res) => setNewUpdate(res));
    }, []);

    return (
        <>
            {newUpdate && newUpdate.tag_name === "v1.0.17" && (
                <NewUpdateDialog newVersion={newUpdate} />
            )}
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
                    }}
                />
                <Stack.Screen
                    name="Chapter"
                    component={Chapter}
                    options={{ ...TransitionPresets.SlideFromRightIOS }}
                />
                <Stack.Screen name="MoreStack" component={MoreStack} />
                <Stack.Screen name="Extension" component={Extension} />
            </Stack.Navigator>
        </>
    );
};

export default MainNavigator;
