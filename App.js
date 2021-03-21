import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";

import Router from "./src/navigation/Router";

import { createTables, createIndexes } from "./src/services/db";
import { setStatusBar } from "./src/services/asyncStorage";

// Redux
import { Provider } from "react-redux";
import { persistor, store } from "./src/redux/store/configureStore";
import { PersistGate } from "redux-persist/lib/integration/react";

const getFonts = () =>
    Font.loadAsync({
        "pt-sans-bold": require("./assets/fonts/PTSansNarrow-Bold.ttf"),
    });

const App = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    setStatusBar();

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
                <PersistGate loading={null} persistor={persistor}>
                    <StatusBar />
                    <NavigationContainer>
                        <Router />
                    </NavigationContainer>
                </PersistGate>
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
};

export default App;
