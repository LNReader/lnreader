import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Languages } from '@utils/constants/languages';
import { PluginItem } from '../../sources/types';

interface PLuginsState {
  availablePlugins: Record<Languages, Array<PluginItem>>;
  installedPlugins: Array<PluginItem>;
  languagesFilter: Array<Languages>;
  lastUsed: PluginItem | null;
  pinnedPlugins: Array<PluginItem>;
  searchResults: Array<PluginItem>;
}

const initialState: PLuginsState = {
  availablePlugins: {} as Record<Languages, Array<PluginItem>>,
  installedPlugins: [],
  languagesFilter: [Languages.English],
  lastUsed: null,
  pinnedPlugins: [],
  searchResults: [],
};

export const sourcesSlice = createSlice({
  name: 'sourcesSlice',
  initialState,
  reducers: {
    fetchPluginsAction: (
      state,
      action: PayloadAction<Record<Languages, Array<PluginItem>>>,
    ) => {
      state.availablePlugins = action.payload;
    },
    installPluginAction: (state, action: PayloadAction<PluginItem>) => {
      state.installedPlugins = [...state.installedPlugins, action.payload];
      state.availablePlugins[action.payload.lang] = state.availablePlugins[
        action.payload.lang
      ].filter(plugin => plugin.id !== action.payload.id);
    },
    uninstallPluginAction: (state, action: PayloadAction<PluginItem>) => {
      state.installedPlugins = state.installedPlugins.filter(
        plugin => plugin.id !== action.payload.id,
      );
      state.availablePlugins[action.payload.lang] = [
        ...state.availablePlugins[action.payload.lang],
        action.payload,
      ];
    },
    searchSourcesAction: (state, action: PayloadAction<string>) => {
      let results = [] as Array<PluginItem>;
      for (let lang in state.availablePlugins) {
        const matchResuls = state.availablePlugins[lang as Languages].filter(
          plugin =>
            plugin.name.toLowerCase().includes(action.payload.toLowerCase()),
        );
        results = results.concat(matchResuls);
      }
      state.searchResults = results;
    },
    setLastUsedSource: (state, action: PayloadAction<PluginItem>) => {
      state.lastUsed = action.payload;
    },
    togglePinSource: (state, action: PayloadAction<PluginItem>) => {
      if (state.pinnedPlugins.find(plugin => plugin.id === action.payload.id)) {
        state.pinnedPlugins = state.pinnedPlugins.filter(
          plugin => plugin.id !== action.payload.id,
        );
      } else {
        state.pinnedPlugins = [...state.pinnedPlugins, action.payload];
      }
    },
    toggleLanguageFilter: (state, action: PayloadAction<Languages>) => {
      if (state.languagesFilter.indexOf(action.payload) > -1) {
        state.languagesFilter = state.languagesFilter.filter(
          lang => lang !== action.payload,
        );
      } else {
        state.languagesFilter = [...state.languagesFilter, action.payload];
      }
    },
  },
});

export const {
  fetchPluginsAction,
  togglePinSource,
  toggleLanguageFilter,
  setLastUsedSource,
  searchSourcesAction,
  installPluginAction,
  uninstallPluginAction,
} = sourcesSlice.actions;

export default sourcesSlice.reducer;
