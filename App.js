import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";

import Router from "./src/navigation/Router";

// Redux
import { Provider, useSelector } from "react-redux";
import { persistor, store } from "./src/redux/store";
import { PersistGate } from "redux-persist/lib/integration/react";
import { createDB, deleteDb } from "./src/database/DBHelper";
import { checkGithubRelease } from "./src/services/updates";
import NewUpdateDialog from "./src/components/NewUpdateDialog";

const getFonts = () =>
    Font.loadAsync({
        "pt-sans-bold": require("./assets/fonts/PTSansNarrow-Bold.ttf"),
        "arbutus-slab": require("./assets/fonts/ArbutusSlab-Regular.ttf"),
        domine: require("./assets/fonts/Domine-VariableFont_wght.ttf"),
        lato: require("./assets/fonts/Lato-Regular.ttf"),
        "noto-sans": require("./assets/fonts/NotoSans-Regular.ttf"),
        "open-sans": require("./assets/fonts/OpenSans-Regular.ttf"),
        "pt-serif": require("./assets/fonts/PTSerif-Regular.ttf"),
    });

const App = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => createDB(), []);

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
