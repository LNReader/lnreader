import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AllSources from '../../sources/sources.json';

import { translations } from 'i18n-js';
import { localization } from '../../../strings/translations';
import { Source } from '../../sources/types';

const languages = {
  'en': 'English',
  'es': 'Spanish',
  'tr': 'Turkish',
  'ru': 'Russian',
  'ar': 'Arabic',
  'uk': 'Ukrainian',
  'pt': 'Portuguese',
  'pt-BR': 'Portuguese',
  'de': 'German',
  'it': 'Italian',
  'zh-CN': 'Chinese',
  'zh-TW': 'Chinese',
  'vi': 'Vietnamese',
  'ja': 'Japanese',
};
// Hope you can do something to synchronize translation system.
// Also take care of some case like vi-VN: Vietnamese not vi
export const defaultLanguage =
  localization in translations || localization.split('-')[0] in translations
    ? languages[localization] || languages[localization.split('-')[0]]
    : 'English';
// That's why this code is so long :(

interface SourcesState {
  allSources: Source[];
  searchResults: Source[];
  pinnedSourceIds: number[];
  lastUsed: number | null;
  languageFilters: string[];
}

const initialState: SourcesState = {
  allSources: AllSources,
  searchResults: [],
  pinnedSourceIds: [],
  lastUsed: null,
  languageFilters: [defaultLanguage],
};

export const sourcesSlice = createSlice({
  name: 'sourcesSlice',
  initialState,
  reducers: {
    getSourcesAction: state => {
      const sources = AllSources.filter(
        source => state.languageFilters.indexOf(source.lang) !== -1,
      ).sort((a, b) => a.sourceName.localeCompare(b.sourceName));

      state.allSources = sources;
    },
    searchSourcesAction: (state, action: PayloadAction<string>) => {
      if (state?.pinnedSourceIds === undefined) {
        state.pinnedSourceIds = [];
      }

      state.searchResults = state.allSources.filter((source: Source) =>
        source.sourceName.toLowerCase().includes(action.payload.toLowerCase()),
      );
    },
    setLastUsedSource: (state, action: PayloadAction<{ sourceId: number }>) => {
      state.lastUsed = action.payload.sourceId;
    },
    togglePinSource: (state, action: PayloadAction<number>) => {
      if (state?.pinnedSourceIds === undefined) {
        state.pinnedSourceIds = [];
      }

      if (state.pinnedSourceIds?.indexOf(action.payload) > -1) {
        state.pinnedSourceIds = state.pinnedSourceIds.filter(
          source => source !== action.payload,
        );
      } else {
        state.pinnedSourceIds = [...state.pinnedSourceIds, action.payload];
      }
    },
    toggleLanguageFilter: (
      state,
      action: PayloadAction<{ language: string }>,
    ) => {
      if (state.languageFilters.indexOf(action.payload.language) > -1) {
        state.languageFilters = state.languageFilters.filter(
          item => item !== action.payload.language,
        );
      } else {
        state.languageFilters = [
          ...state.languageFilters,
          action.payload.language,
        ];
      }
    },
  },
});

export const {
  getSourcesAction,
  togglePinSource,
  toggleLanguageFilter,
  setLastUsedSource,
  searchSourcesAction,
} = sourcesSlice.actions;

export default sourcesSlice.reducer;
