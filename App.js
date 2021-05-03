import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Provider as PaperProvider } from "react-native-paper";
import Main from "./src/Navigators/Main";

import { Provider } from "react-redux";
import { persistor, store } from "./src/redux/store";
import { PersistGate } from "redux-persist/lib/integration/react";
import { createDB, deleteDb } from "./src/database/DBHelper";

const App = () => {
    const [loaded] = useFonts({
        "pt-sans-bold": require("./assets/fonts/PTSansNarrow-Bold.ttf"),
        "arbutus-slab": require("./assets/fonts/ArbutusSlab-Regular.ttf"),
        domine: require("./assets/fonts/Domine-VariableFont_wght.ttf"),
        lato: require("./assets/fonts/Lato-Regular.ttf"),
        "noto-sans": require("./assets/fonts/NotoSans-Regular.ttf"),
        "open-sans": require("./assets/fonts/OpenSans-Regular.ttf"),
        "pt-serif": require("./assets/fonts/PTSerif-Regular.ttf"),
    });

    useEffect(() => createDB(), []);

    if (!loaded) {
        return null;
    }

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <PaperProvider>
                    <NavigationContainer>
                        <Main />
                    </NavigationContainer>
                </PaperProvider>
            </PersistGate>
        </Provider>
    );
};

export default App;
