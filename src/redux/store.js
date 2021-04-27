import { createStore, applyMiddleware, combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import thunk from "redux-thunk";

import themeReducer from "./theme/theme.reducer";
import settingsReducer from "./settings/settings.reducer";
import libraryReducer from "./library/library.reducer";
import extensionReducer from "./source/source.reducers";
import novelReducer from "./novel/novel.reducer";
import historyReducer from "./history/history.reducer";
import updatesReducer from "./updates/updates.reducer";
import trackerReducer from "./tracker/tracker.reducer";

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
        updatesReducer,
        trackerReducer,
    })
);

export const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);
