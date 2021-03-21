import { createStore, applyMiddleware, combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import thunk from "redux-thunk";

import themeReducer from "../reducers/theme";
import settingsReducer from "../reducers/settings";
import libraryReducer from "../reducers/library";
import extensionReducer from "../reducers/extension";
import novelReducer from "../reducers/novel";
import historyReducer from "../reducers/history";

const persistConfig = {
    key: "root",
    storage: AsyncStorage,
    blacklist: ["novelReducer"],
};

const persistedReducer = persistReducer(
    persistConfig,
    combineReducers({
        themeReducer,
        settingsReducer,
        libraryReducer,
        extensionReducer,
        novelReducer,
        historyReducer,
    })
);

export const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);
