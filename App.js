import React, { useEffect } from "react";
import { StatusBar } from "react-native";

import { useFonts } from "expo-font";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import { persistor, store } from "./src/redux/store";
import { PersistGate } from "redux-persist/lib/integration/react";

import Main from "./src/navigators/Main";

import { createDB, deleteDb } from "./src/database/DBHelper";
import { fonts } from "./src/theme/fonts";

const App = () => {
    const [loaded] = useFonts(fonts);

    useEffect(() => {
        createDB();
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
