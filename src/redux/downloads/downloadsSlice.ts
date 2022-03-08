import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ChapterItem } from '../../database/types';

interface SettingsState {
  downloadQueue: ChapterItem[];
}

const initialState: SettingsState = {
  downloadQueue: [],
};

export const settingsSlice = createSlice({
  name: 'downloadsReducer',
  initialState,
  reducers: {
    addToDownloadQueue: (state, action: PayloadAction<ChapterItem[]>) => {
      state.downloadQueue = state.downloadQueue.concat(action.payload);
    },
    removeFromDownloadQueue: (state, action: PayloadAction<number>) => {
      state.downloadQueue = state.downloadQueue.filter(
        (chapter: ChapterItem) => chapter.chapterId !== action.payload,
      );
    },
    clearDownloadQueue: state => {
      state.downloadQueue = [];
    },
  },
});

export const {
  addToDownloadQueue,
  removeFromDownloadQueue,
  clearDownloadQueue,
} = settingsSlice.actions;

export default settingsSlice.reducer;
