import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  getChapters,
  insertChapters,
} from '../../database/queries/ChapterQueries';
import {insertNovel, getNovelFromDb} from '../../database/queries/NovelQueries';
import {ChapterItem, NovelInfo} from '../../database/types';
import {sourceManager} from '../../sources/sourceManager';

interface NovelState {
  loading: boolean;
  updating: boolean;
  novel: NovelInfo | null;
  chapters: ChapterItem[] | null;
}

const initialState: NovelState = {
  loading: true,
  updating: false,
  novel: null,
  chapters: null,
};

interface GetNovelResponse {
  novel: NovelInfo | null;
  chapters: ChapterItem[] | null;
}

interface GetNovelRequestProps {
  novelUrl: string;
  sourceId: number;
}

export const getNovel = createAsyncThunk(
  'novelSlice/getNovel',
  async ({novelUrl, sourceId}: GetNovelRequestProps) => {
    let novel = await getNovelFromDb(sourceId, novelUrl);
    let chapters = [];
    if (!novel) {
      const source = sourceManager(sourceId);
      const sourceNovel = await source.parseNovelAndChapters(novelUrl);

      const novelId = await insertNovel(sourceNovel);

      if (sourceNovel.chapters) {
        await insertChapters(novelId, sourceNovel.chapters);
      }

      novel = await getNovelFromDb(sourceId, novelUrl);
    }

    chapters = await getChapters(novel.novelId);

    return {
      novel,
      chapters,
    };
  },
);

export const novelSlice = createSlice({
  name: 'novelSlice',
  initialState,
  reducers: {
    setNovelLoading: state => {
      state.loading = true;
    },
    toggleFollowNovel: state => {
      if (state.novel) {
        state.novel.followed = +!state.novel?.followed;
      }
    },
    updateChapterDownloaded: (state, action: PayloadAction<number>) => {
      if (state.chapters) {
        state.chapters = state.chapters?.map(chapter =>
          chapter.chapterId === action.payload
            ? {...chapter, downloaded: +!chapter.downloaded}
            : chapter,
        );
      }
    },
    updateChapterBookmarked: (state, action: PayloadAction<number>) => {
      if (state.chapters) {
        state.chapters = state.chapters?.map(chapter =>
          chapter.chapterId === action.payload
            ? {...chapter, bookmark: +!chapter.bookmark}
            : chapter,
        );
      }
    },
    updateChapterRead: (state, action: PayloadAction<number>) => {
      if (state.chapters) {
        state.chapters = state.chapters?.map(chapter =>
          chapter.chapterId === action.payload
            ? {...chapter, read: 1}
            : chapter,
        );
      }
    },
  },
  extraReducers: {
    [getNovel.fulfilled]: (
      state: NovelState,
      action: PayloadAction<GetNovelResponse>,
    ) => {
      state.novel = action.payload.novel;
      state.chapters = action.payload.chapters;
      state.loading = false;
    },
    [getNovel.pending]: (state: NovelState) => {
      state.loading = true;
    },
  },
});

export const {
  setNovelLoading,
  toggleFollowNovel,
  updateChapterDownloaded,
  updateChapterBookmarked,
  updateChapterRead,
} = novelSlice.actions;

export default novelSlice.reducer;
