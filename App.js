import React, { useEffect } from "react";
import { StatusBar } from "react-native";

import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

import { useFonts } from "expo-font";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import { persistor, store } from "./src/redux/store";
import { PersistGate } from "redux-persist/lib/integration/react";

import Main from "./src/Navigators/Main";

import { createDB, deleteDb } from "./src/Database/DBHelper";
import { fonts } from "./src/Theme/fonts";

const App = () => {
    const [loaded] = useFonts(fonts);

    useEffect(() => {
        createDB();
        setTimeout(async () => {
            await SplashScreen.hideAsync();
        }, 2000);
    }, []);

    if (!loaded) {
        return null;
    }

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <PaperProvider>
                    <StatusBar
                        translucent={true}
                        backgroundColor="transparent"
                    />
                    <Main />
                </PaperProvider>
            </PersistGate>
        </Provider>
    );
};

export default App;
