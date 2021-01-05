import React, { useState, useEffect } from "react";

import { StatusBar } from "expo-status-bar";

import { NavigationContainer } from "@react-navigation/native";
import Router from "./src/navigation/Router";

import * as Font from "expo-font";
import AppLoading from "expo-app-loading";

import { createTables, createIndexes } from "./src/services/db";

const getFonts = () =>
    Font.loadAsync({
        "pt-sans-bold": require("./assets/fonts/PTSansNarrow-Bold.ttf"),
    });

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    const createDb = () => {
        createTables();
        createIndexes();
    };

    useEffect(() => {
        createDb();
    }, []);

    if (fontsLoaded) {
        return (
            <>
                <StatusBar style="light" />
                <NavigationContainer>
                    <Router />
                </NavigationContainer>
            </>
        );
    } else {
        return (
            <AppLoading
                startAsync={getFonts}
                onError={() => warn(error)}
                onFinish={() => setFontsLoaded(true)}
            />
        );
    }
}
