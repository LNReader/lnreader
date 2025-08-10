import {
  getChapterCount,
  getPageChaptersBatched,
  insertChapters,
  getPageChapters as _getPageChapters,
} from '@database/queries/ChapterQueries';
import { ChapterInfo, NovelInfo } from '@database/types';
import { useNovelPages, useNovelSettings } from '@hooks/persisted';
import { fetchPage } from '@services/plugin/fetch';
import { showToast } from '@utils/showToast';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { NovelStateContext } from './NovelStateContext';
import { getString } from '@strings/translations';

interface BatchInfo {
  batch: number;
  total: number;
  totalChapters?: number;
}

interface ChapterState {
  chapters: ChapterInfo[];
  fetching: boolean;
  batchInformation: BatchInfo;
}

type Action =
  | { type: 'SET_FETCHING'; value: boolean }
  | { type: 'SET_CHAPTERS'; chapters: ChapterInfo[]; batch: BatchInfo }
  | { type: 'EXTEND_CHAPTERS'; chapters: ChapterInfo[]; batch: BatchInfo }
  | { type: 'UPDATE_CHAPTER'; index: number; update: Partial<ChapterInfo> }
  | {
      type: 'MUTATE_CHAPTERS';
      mutation: (chs: ChapterInfo[]) => ChapterInfo[];
    };

// #region reducer
function reducer(state: ChapterState, action: Action): ChapterState {
  switch (action.type) {
    case 'SET_FETCHING':
      return { ...state, fetching: action.value };

    case 'SET_CHAPTERS':
      return {
        chapters: action.chapters,
        fetching: false,
        batchInformation: action.batch,
      };

    case 'EXTEND_CHAPTERS':
      return {
        ...state,
        chapters: [...state.chapters, ...action.chapters],
        batchInformation: action.batch,
      };

    case 'UPDATE_CHAPTER': {
      const next = [...state.chapters];
      next[action.index] = { ...next[action.index], ...action.update };
      return { ...state, chapters: next };
    }

    case 'MUTATE_CHAPTERS':
      return { ...state, chapters: action.mutation(state.chapters) };

    default:
      return state;
  }
}

// #endregion
// #region context
interface ChapterContextValue extends ChapterState {
  getChapters: (n?: NovelInfo) => Promise<void>;
  setChapters: (chs: ChapterInfo[], batchInfo: BatchInfo) => void;
  extendChapters: (chs: ChapterInfo[], batchInfo: BatchInfo) => void;
  mutateChapters: (m: (chs: ChapterInfo[]) => ChapterInfo[]) => void;
  updateChapter: (i: number, u: Partial<ChapterInfo>) => void;
  setFetching: (v: boolean) => void;
}

export const NovelChaptersContext = createContext<ChapterContextValue | null>(
  null,
);

// #endregion
// #region provider
export function NovelChaptersContextProvider({
  children,
}: {
  children: React.JSX.Element;
}) {
  const novelState = useContext(NovelStateContext);
  if (!novelState) {
    throw new Error(
      'useNovelState must be used within NovelStateContextProvider',
    );
  }

  const { novel, path, pluginId, loading, getNovel } = novelState;
  const { novelSettings } = useNovelSettings();
  const { page: currentPage } = useNovelPages();

  const [state, dispatch] = useReducer(reducer, {
    chapters: [],
    fetching: false,
    batchInformation: { batch: 0, total: 0 },
  });

  const setFetching = useCallback(
    (v: boolean) => dispatch({ type: 'SET_FETCHING', value: v }),
    [],
  );

  const setChapters = useCallback(
    (chs: ChapterInfo[], batchInfo: BatchInfo) =>
      dispatch({ type: 'SET_CHAPTERS', chapters: chs, batch: batchInfo }),
    [],
  );

  const extendChapters = useCallback(
    (chs: ChapterInfo[], batchInfo: BatchInfo) =>
      dispatch({ type: 'EXTEND_CHAPTERS', chapters: chs, batch: batchInfo }),
    [],
  );

  const mutateChapters = useCallback(
    (m: (c: ChapterInfo[]) => ChapterInfo[]) =>
      dispatch({ type: 'MUTATE_CHAPTERS', mutation: m }),
    [],
  );

  const updateChapter = useCallback(
    (idx: number, up: Partial<ChapterInfo>) =>
      dispatch({ type: 'UPDATE_CHAPTER', index: idx, update: up }),
    [],
  );

  const getChapters = useCallback(
    async (passedNovel?: NovelInfo) => {
      if (!loading || passedNovel) {
        const novelName = passedNovel?.name ?? novel.name;
        const novelId = passedNovel?.id ?? (novel.id as number);
        let newChapters: ChapterInfo[] = [];

        const config = [
          novelId,
          novelName,
          novelSettings.sort,
          novelSettings.filter,
          currentPage,
          state.batchInformation.batch,
        ] as const;

        let chapterCount = getChapterCount(novelId, currentPage);

        if (chapterCount) {
          try {
            newChapters = getPageChaptersBatched(...config) || [];
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('teaser', error);
          }
        }
        // Fetch next page if no chapters
        else if (Number(currentPage)) {
          const sourcePage = await fetchPage(pluginId, path, currentPage);
          const sourceChapters = sourcePage.chapters.map(ch => {
            return {
              ...ch,
              page: currentPage,
            };
          });
          await insertChapters(novelId, sourceChapters);
          newChapters = await _getPageChapters(...config);
          chapterCount = getChapterCount(novelId, currentPage);
        }

        const batchInformation = {
          batch: 0,
          total: Math.floor(chapterCount / 300),
          totalChapters: chapterCount,
        };
        dispatch({
          type: 'SET_CHAPTERS',
          chapters: newChapters,
          batch: batchInformation,
        });
      }
    },
    [
      loading,
      novel.name,
      novel.id,
      novelSettings.sort,
      novelSettings.filter,
      currentPage,
      state.batchInformation.batch,
      pluginId,
      path,
    ],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const nov = await getNovel();
        if (!nov || cancelled) {
          throw new Error(getString('updatesScreen.unableToGetNovel'));
        }
        await getChapters(nov);
      } catch (e: any) {
        // eslint-disable-next-line no-console
        if (__DEV__) console.error(e);
        showToast(e.message);
        setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      setChapters,
      getChapters,
      extendChapters,
      mutateChapters,
      updateChapter,
      setFetching,
    }),
    [
      extendChapters,
      getChapters,
      mutateChapters,
      setChapters,
      setFetching,
      state,
      updateChapter,
    ],
  );
  return (
    <NovelChaptersContext.Provider value={contextValue}>
      {children}
    </NovelChaptersContext.Provider>
  );
}
