import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum ChapterTitleDisplayModes {
  SOURCE_TITLE = 'Source title',
  CHAPTER_NUMBER = 'Chapter number',
}

interface ChapterData {
  progressPercentage: number;
  progressLocation: number;
}

interface NovelData {
  filters?: string[];
  sort?: string;
  chapterTitleDisplayMode?: ChapterTitleDisplayModes;
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
      state.chapterData[action.payload.chapterId] = {
        progressLocation: action.payload.progressLocation,
        progressPercentage: action.payload.progressPercentage,
      };
    },
    setNovelChapterFilter: (
      state,
      action: PayloadAction<{ novelId: number; filter: string }>,
    ) => {
      const novelId = action.payload.novelId;
      if (state.novelData[novelId]) {
        state.novelData[novelId] = {};
      }
      if (!state.novelData[novelId].filters) {
        state.novelData[novelId].filters = [];
      }

      if (
        state.novelData[action.payload.novelId].filters.includes(
          action.payload.filter,
        )
      ) {
        state.novelData[action.payload.novelId].filters = state.novelData[
          action.payload.novelId
        ].filters.filter(item => item !== action.payload.filter);
      } else {
        state.novelData[action.payload.novelId].filters = [
          ...state.novelData[action.payload.novelId].filters,
          action.payload.filter,
        ];
      }
    },
    setNovelChapterSortOrder: (
      state,
      action: PayloadAction<{ novelId: number; sort: string }>,
    ) => {
      const novelId = action.payload.novelId;
      if (!state.novelData[novelId]) {
        state.novelData[novelId] = {};
      }

      state.novelData[action.payload.novelId].sort = action.payload.sort;
    },
    setNovelChapterTitleDisplayMode: (
      state,
      action: PayloadAction<{
        novelId: number;
        chapterTitleDisplayMode: ChapterTitleDisplayModes;
      }>,
    ) => {
      const novelId = action.payload.novelId;
      if (state.novelData[novelId] === undefined) {
        state.novelData[novelId] = {};
      }
      state.novelData[action.payload.novelId].chapterTitleDisplayMode =
        action.payload.chapterTitleDisplayMode;
    },
  },
});

export const {
  saveChapterProgress,
  setNovelChapterFilter,
  setNovelChapterSortOrder,
  setNovelChapterTitleDisplayMode,
} = localStorageSlice.actions;

export default localStorageSlice.reducer;
