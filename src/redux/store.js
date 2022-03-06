import { createStore, applyMiddleware, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import thunk from 'redux-thunk';

import settingsReducer from './settings/settings.reducer';
import libraryReducer from './library/library.reducer';
import sourceReducer from './source/source.reducers';
import novelReducer from './novel/novel.reducer';
import updatesReducer from './updates/updates.reducer';
import trackerReducer from './tracker/tracker.reducer';
import preferenceReducer from './preferences/preference.reducer';
import downloadsReducer from './downloads/downloads.reducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['novelReducer'],
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    settingsReducer,
    libraryReducer,
    sourceReducer,
    novelReducer,
    updatesReducer,
    trackerReducer,
    preferenceReducer,
    downloadsReducer,
  }),
);

export const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);
