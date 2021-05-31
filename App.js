import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Provider as PaperProvider } from "react-native-paper";
import Main from "./src/Navigators/Main";

import { Provider } from "react-redux";
import { persistor, store } from "./src/redux/store";
import { PersistGate } from "redux-persist/lib/integration/react";
import { createDB, deleteDb } from "./src/Database/DBHelper";
import { fonts } from "./src/Theme/fonts";

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
                    <Main />
                </PaperProvider>
            </PersistGate>
        </Provider>
    );
};

export default App;
