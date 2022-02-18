import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface ChapterData {
  progressPercentage: number;
  progressLocation: number;
}

interface NovelData {
  filters: string[];
  sort: string;
}

interface localStorageState {
  novelData: Record<number, NovelData>;
  chapterData: Record<number, ChapterData>;
}

const initialState: localStorageState = {
  novelData: [],
  chapterData: [],
};

export const localStorageSlice = createSlice({
  name: 'localStorageSlice',
  initialState,
  reducers: {
    saveChapterProgress: (
      state,
      action: PayloadAction<{
        chapterId: number;
        progressPercentage: number;
        progressLocation: number;
      }>,
    ) => {
      console.log(action.payload);

      state.chapterData[action.payload.chapterId] = {
        progressLocation: action.payload.progressLocation,
        progressPercentage: action.payload.progressPercentage,
      };
    },
  },
});

export const {saveChapterProgress} = localStorageSlice.actions;

export default localStorageSlice.reducer;
