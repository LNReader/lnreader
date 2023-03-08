import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Languages } from '@utils/constants/languages';
import { PluginItem } from '@plugins/types';

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
  installedPlugins: [] as Array<PluginItem>,
  languagesFilter: [Languages.English],
  lastUsed: null,
  pinnedPlugins: [] as Array<PluginItem>,
  searchResults: [] as Array<PluginItem>,
};

export const sourcesSlice = createSlice({
  name: 'pluginsSlice',
  initialState,
  reducers: {
    fetchPluginsAction: (
      state,
      action: PayloadAction<Record<Languages, Array<PluginItem>>>,
    ) => {
      for (let key in action.payload) {
        const lang = key as Languages;
        action.payload[lang] = action.payload[lang].filter(
          plugin => !state.installedPlugins.find(plg => plg.id === plugin.id),
        );
      }
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
    searchPluginsAction: (state, action: PayloadAction<string>) => {
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
    setLastUsedPlugin: (state, action: PayloadAction<PluginItem>) => {
      state.lastUsed = action.payload;
    },
    togglePinPlugin: (state, action: PayloadAction<PluginItem>) => {
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
  togglePinPlugin,
  toggleLanguageFilter,
  setLastUsedPlugin,
  searchPluginsAction,
  installPluginAction,
  uninstallPluginAction,
} = sourcesSlice.actions;

export default sourcesSlice.reducer;