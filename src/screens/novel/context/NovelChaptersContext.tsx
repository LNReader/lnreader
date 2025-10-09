import {
  getChapterCount,
  getPageChaptersBatched,
  insertChapters,
  getPageChapters as _getPageChapters,
} from '@database/queries/ChapterQueries';
import { ChapterInfo, NovelInfo } from '@database/types';
import { useNovelPages, useNovelSettings } from '@hooks/persisted';
import { NovelSettingsContext } from './NovelSettingsContext';
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
import ServiceManager, {
  DownloadChapterTask,
  QueuedBackgroundTask,
} from '@services/ServiceManager';

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
  sortAndFilterChapters: (sort?: string, filter?: string) => void;
}

export const NovelChaptersContext = createContext<ChapterContextValue | null>(
  null,
);

const serviceManager = ServiceManager.manager;

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

  const novelSettingsContext = useContext(NovelSettingsContext);
  if (!novelSettingsContext) {
    throw new Error(
      'NovelSettingsContext must be used within NovelSettingsContextProvider',
    );
  }
  const { setNovelSettings } = novelSettingsContext;
  const { page: currentPage } = useNovelPages();

  const [state, dispatch] = useReducer(reducer, {
    chapters: [],
    fetching: true,
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

  const getChaptersFromDB = useCallback(
    (novelId: number, novelName: string, pageToLoad: string): ChapterInfo[] => {
      const config = [
        novelId,
        novelName,
        novelSettings.sort,
        novelSettings.filter,
        pageToLoad,
        state.batchInformation.batch,
      ] as const;

      try {
        return getPageChaptersBatched(...config) || [];
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching chapters from DB:', error);
        return [];
      }
    },
    [novelSettings.sort, novelSettings.filter, state.batchInformation.batch],
  );

  const fetchAndStoreChapters = useCallback(
    async (novelId: number, pageToLoad: string): Promise<ChapterInfo[]> => {
      const sourcePage = await fetchPage(pluginId, path, pageToLoad);

      const sourceChapters = sourcePage.chapters.map(ch => {
        return {
          ...ch,
          page: pageToLoad,
        };
      });

      await insertChapters(novelId, sourceChapters);

      const config = [
        novelId,
        novel.name,
        novelSettings.sort,
        novelSettings.filter,
        pageToLoad,
        state.batchInformation.batch,
      ] as const;

      return await _getPageChapters(...config);
    },
    [
      pluginId,
      path,
      novel.name,
      novelSettings.sort,
      novelSettings.filter,
      state.batchInformation.batch,
    ],
  );

  const loadChaptersSync = useCallback(
    (novelId: number, novelName: string, pageToLoad: string): boolean => {
      const chapterCount = getChapterCount(
        novelId,
        pageToLoad,
        novelSettings.filter,
      );

      if (chapterCount) {
        const newChapters = getChaptersFromDB(novelId, novelName, pageToLoad);

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
        return true; // Successfully loaded synchronously
      }
      return false; // Chapters don't exist, need async loading
    },
    [novelSettings.filter, getChaptersFromDB],
  );

  const sortAndFilterChapters = useCallback(
    (sort?: string, filter?: string) => {
      // Update the settings
      setNovelSettings({
        showChapterTitles: novelSettings?.showChapterTitles,
        sort,
        filter,
      });

      // If we have a novel available, immediately load chapters synchronously
      const nov: NovelInfo | undefined =
        novel && typeof novel.id === 'number'
          ? (novel as NovelInfo)
          : undefined;

      if (nov) {
        const pageToLoad = currentPage || '1';
        loadChaptersSync(nov.id, nov.name, pageToLoad);
      }
    },
    [
      novelSettings?.showChapterTitles,
      setNovelSettings,
      novel,
      currentPage,
      loadChaptersSync,
    ],
  );

  const getChapters = useCallback(
    async (passedNovel?: NovelInfo) => {
      if (!loading || passedNovel) {
        const novelName = passedNovel?.name ?? novel.name;
        const novelId = passedNovel?.id ?? (novel.id as number);
        const pageToLoad = currentPage || '1'; // Default to page 1 if currentPage not available

        const chapterCount = getChapterCount(
          novelId,
          pageToLoad,
          novelSettings.filter,
        );

        let newChapters: ChapterInfo[];

        if (chapterCount) {
          // Chapters exist in DB, use synchronous path
          newChapters = getChaptersFromDB(novelId, novelName, pageToLoad);
        }
        // Fetch from source if no chapters exist and page is valid
        else if (Number(pageToLoad)) {
          // Chapters need to be fetched, use asynchronous path
          newChapters = await fetchAndStoreChapters(novelId, pageToLoad);
        } else {
          newChapters = [];
        }

        const finalChapterCount =
          chapterCount ||
          getChapterCount(novelId, pageToLoad, novelSettings.filter);

        const batchInformation = {
          batch: 0,
          total: Math.floor(finalChapterCount / 300),
          totalChapters: finalChapterCount,
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
      novelSettings.filter,
      currentPage,
      getChaptersFromDB,
      fetchAndStoreChapters,
    ],
  );

  useEffect(() => {
    const handleTaskCompletion = (task: QueuedBackgroundTask) => {
      if (task.task.name === 'DOWNLOAD_CHAPTER') {
        const chapterId = (task.task as DownloadChapterTask).data.chapterId;
        if (task.meta.finalStatus === 'completed') {
          mutateChapters(chs => {
            const chIndex = chs.findIndex(ch => ch.id === chapterId);
            if (chIndex !== -1) {
              chs[chIndex].isDownloaded = true;
            }
            return chs;
          });
        }
      }
    };

    serviceManager.addCompletionListener(handleTaskCompletion);

    return () => {
      serviceManager.removeCompletionListener(handleTaskCompletion);
    };
  }, [mutateChapters]);

  // TODO: Refactor to not rely on useEffect
  useEffect(() => {
    // Only load chapters if novel is loaded and we have a valid currentPage
    if (loading || !currentPage) return;

    let cancelled = false;

    // Try synchronous path first if novel is available
    const nov: NovelInfo | undefined =
      novel && typeof novel.id === 'number' ? (novel as NovelInfo) : undefined;

    if (nov) {
      const pageToLoad = currentPage || '1';
      // Try synchronous loading first
      const syncSuccess = loadChaptersSync(nov.id, nov.name, pageToLoad);
      if (syncSuccess) {
        return () => {}; // No cleanup needed for sync path
      }
    }

    // Fall back to async path
    (async () => {
      try {
        let novelInfo: NovelInfo | undefined =
          novel && typeof novel.id === 'number'
            ? (novel as NovelInfo)
            : undefined;
        if (!novelInfo) {
          novelInfo = await getNovel();
        }
        if (!novelInfo || cancelled) {
          throw new Error(getString('updatesScreen.unableToGetNovel'));
        }

        await getChapters(novelInfo);
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
  }, [
    currentPage,
    getChapters,
    getNovel,
    loadChaptersSync,
    loading,
    novel,
    setFetching,
  ]);

  const contextValue = useMemo(
    () => ({
      ...state,
      setChapters,
      getChapters,
      extendChapters,
      mutateChapters,
      updateChapter,
      setFetching,
      sortAndFilterChapters,
    }),
    [
      extendChapters,
      getChapters,
      mutateChapters,
      setChapters,
      setFetching,
      sortAndFilterChapters,
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
