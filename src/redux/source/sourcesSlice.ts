import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import sourceList from '../../sources/sources.json';

import { Source } from '../../sources/types';

interface SourcesState {
  allSources: Source[];
  pinnedSources: number[];
  lastUsed: number | null;
  languageFilters: string[];
}

const initialState: SourcesState = {
  allSources: [],
  pinnedSources: [],
  lastUsed: null,
  languageFilters: ['English'],
};

export const sourcesSlice = createSlice({
  name: 'sourcesSlice',
  initialState,
  reducers: {
    getSourcesAction: state => {
      let sources: Source[] = sourceList;

      sources = sources.sort((a, b) =>
        a.sourceName.localeCompare(b.sourceName),
      );

      sources = sources.filter(
        source => state.languageFilters.indexOf(source.lang) !== -1,
      );

      state.allSources = sources;
    },
    searchSourcesAction: (state, action: PayloadAction<string>) => {
      state.allSources = sourceList.filter(
        (source: Source) =>
          source.sourceName
            .toLowerCase()
            .includes(action.payload.toLowerCase()) &&
          state.languageFilters.indexOf(source.lang) !== -1,
      );
    },
    setLastUsedSource: (state, action: PayloadAction<{ sourceId: number }>) => {
      state.lastUsed = action.payload.sourceId;
    },
    togglePinSource: (state, action: PayloadAction<number>) => {
      if (state.pinnedSources.indexOf(action.payload) > -1) {
        state.pinnedSources = state.pinnedSources.filter(
          source => source !== action.payload,
        );
      } else {
        state.pinnedSources = [...state.pinnedSources, action.payload];
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
