import React, { useState, useEffect } from "react";

import { StatusBar } from "expo-status-bar";

import { NavigationContainer } from "@react-navigation/native";
import Router from "./src/navigation/Router";

import * as Font from "expo-font";
import AppLoading from "expo-app-loading";

import { createTables, createIndexes } from "./src/services/db";

import { Provider } from "react-redux";
import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";

import themeReducer from "./src/theme/theme.reducer";
const store = createStore(
    combineReducers({ themeReducer }),
    applyMiddleware(thunk)
);

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
            <Provider store={store}>
                <StatusBar style="light" />
                <NavigationContainer>
                    <Router />
                </NavigationContainer>
            </Provider>
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
