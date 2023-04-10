import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';

import settingsReducer from './settings/settings.reducer';
import settingsReducerV2 from './settings/settingsSlice';
import sourceReducerV2 from './source/sourcesSlice';
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

const reducers = combineReducers({
  settingsReducer,
  settingsReducerV2,
  sourceReducerV2,
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
