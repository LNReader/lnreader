import { ChapterInfo } from '@database/types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ChapterPosition {
  offsetY: number;
  percentage: number;
}

interface NovelSettings {
  [novelId: number]: {
    lastRead: ChapterInfo;
    sort: string;
    filter: string;
    showChapterTitles: boolean;
    position: {
      [chapterId: number]: ChapterPosition;
    };
  };
}
interface PreferenceState {
  novelSettings: NovelSettings;
}

interface ScrollPositionPayLoad {
  novelId: number;
  chapterId: number;
  offsetY: number;
  percentage: number;
}

interface ChapterListPreferencePayload {
  novelId: number;
  sort: string;
  filter: string;
}

const initialState: PreferenceState = {
  novelSettings: {},
};

const preferenceSlice = createSlice({
  name: 'preferenceSlice',
  initialState,
  reducers: {
    setLastReadAction: (state, action: PayloadAction<ChapterInfo>) => {
      const lastRead = action.payload;
      state.novelSettings[lastRead.novelId] = {
        ...state.novelSettings[lastRead.novelId],
        lastRead: lastRead,
      };
    },
    setChapterListPreference: (
      state,
      action: PayloadAction<ChapterListPreferencePayload>,
    ) => {
      const { novelId, sort, filter } = action.payload;
      state.novelSettings[novelId] = {
        ...state.novelSettings[novelId],
        sort,
        filter,
      };
    },
    showChapterTitlesAction: (
      state,
      action: PayloadAction<{ novelId: number; showChapterTitles: boolean }>,
    ) => {
      const { novelId, showChapterTitles } = action.payload;
      state.novelSettings[novelId] = {
        ...state.novelSettings[novelId],
        showChapterTitles,
      };
    },
    saveScrollPosition: (
      state,
      action: PayloadAction<ScrollPositionPayLoad>,
    ) => {
      const { novelId, chapterId, offsetY, percentage } = action.payload;
      state.novelSettings[novelId] = {
        ...state.novelSettings[novelId],
        position: {
          [chapterId]: {
            offsetY,
            percentage,
          },
        },
      };
    },
    restorePreferenceState: (state, action: PayloadAction<PreferenceState>) => {
      for (let key in state) {
        state[key as keyof PreferenceState] = action.payload[
          key as keyof PreferenceState
        ] as never;
      }
    },
  },
});

export const {
  setLastReadAction,
  setChapterListPreference,
  showChapterTitlesAction,
  saveScrollPosition,
  restorePreferenceState,
} = preferenceSlice.actions;

export default preferenceSlice.reducer;
