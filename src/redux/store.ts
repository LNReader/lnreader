import { MMKVStorage } from '@utils/mmkv/mmkv';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, Storage } from 'redux-persist';

import settingsReducer from './settings/settings.reducer';
import settingsReducerV2 from './settings/settingsSlice';
import pluginsReducer from './plugins/pluginsSlice';
import novelReducer from './novel/novel.reducer';
import updatesReducer from './updates/updates.reducer';
import trackerReducer from './tracker/tracker.reducer';
import preferenceReducer from './preferences/preference.reducer';
import downloadsReducer from './downloads/downloads.reducer';

const reduxStorage: Storage = {
  setItem: (key, value) => {
    MMKVStorage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: key => {
    const value = MMKVStorage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: key => {
    MMKVStorage.delete(key);
    return Promise.resolve();
  },
};

const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  blacklist: ['novelReducer'],
};

const reducers = combineReducers({
  settingsReducer,
  settingsReducerV2,
  pluginsReducer,
  novelReducer,
  updatesReducer,
  trackerReducer,
  preferenceReducer,
  downloadsReducer,
});

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
