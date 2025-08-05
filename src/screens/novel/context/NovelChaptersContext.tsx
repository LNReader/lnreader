import {
  getChapterCount,
  getPageChaptersBatched,
  insertChapters,
  getPageChapters as _getPageChapters,
} from '@database/queries/ChapterQueries';
import { ChapterInfo } from '@database/types';
import { useNovelPages, useNovelSettings } from '@hooks/persisted';
import useNovelState from '@hooks/persisted/novel/useNovelState';
import { fetchPage } from '@services/plugin/fetch';
import { parseChapterNumber } from '@utils/parseChapterNumber';
import { showToast } from '@utils/showToast';
import dayjs from 'dayjs';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

// ChapterStateContext.tsx
interface ChapterState {
  chapters: ChapterInfo[];
  fetching: boolean; // for chapter loading only
  batchInformation: {
    batch: number;
    total: number;
    totalChapters?: number;
  };
}

interface ChapterActions {
  setChapters: (chapters: ChapterInfo[]) => void;
  getChapters: () => Promise<void>;

  extendChapters: (chapters: ChapterInfo[]) => void;
  mutateChapters: (mutation: (chs: ChapterInfo[]) => ChapterInfo[]) => void;
  updateChapter: (index: number, update: Partial<ChapterInfo>) => void;
  setFetching: (fetching: boolean) => void;
  setBatchInformation: (batch: ChapterState['batchInformation']) => void;
}

export const NovelChaptersContext = createContext<
  (ChapterState & ChapterActions) | null
>(null);

export function NovelChaptersContextProvider({
  children,
}: {
  children: React.JSX.Element;
}) {
  const { novel, loading, path, pluginId } = useNovelState();
  const { novelSettings } = useNovelSettings();
  const { page: currentPage } = useNovelPages();
  const [chapters, _setChapters] = useState<ChapterInfo[]>([]);
  const [fetching, setFetching] = useState(false);
  const [batchInformation, setBatchInformation] = useState<{
    batch: number;
    total: number;
    totalChapters?: number;
  }>({ batch: 0, total: 0 });

  const mutateChapters = useCallback(
    (mutation: (chs: ChapterInfo[]) => ChapterInfo[]) => {
      if (novel) {
        _setChapters(mutation);
      }
    },
    [novel],
  );

  const updateChapter = useCallback(
    (index: number, update: Partial<ChapterInfo>) => {
      if (novel) {
        _setChapters(chs => {
          chs[index] = { ...chs[index], ...update };
          return chs;
        });
      }
    },
    [novel],
  );
  const transformChapters = useCallback(
    (chs: ChapterInfo[]) => {
      if (!novel) return chs;
      const newChapters = chs.map(chapter => {
        const parsedTime = dayjs(chapter.releaseTime);
        const releaseTime = parsedTime.isValid()
          ? parsedTime.format('LL')
          : chapter.releaseTime;
        const chapterNumber = chapter.chapterNumber
          ? chapter.chapterNumber
          : parseChapterNumber(novel.name, chapter.name);
        return {
          ...chapter,
          releaseTime,
          chapterNumber,
        };
      });
      return newChapters;
    },
    [novel],
  );

  const setChapters = useCallback(
    async (chs: ChapterInfo[]) => {
      _setChapters(transformChapters(chs));
    },
    [transformChapters],
  );

  const extendChapters = useCallback(
    async (chs: ChapterInfo[]) => {
      _setChapters(prev => prev.concat(transformChapters(chs)));
    },
    [transformChapters],
  );

  const getChapters = useCallback(async () => {
    if (!loading) {
      let newChapters: ChapterInfo[] = [];

      const config = [
        novel.id,
        novelSettings.sort,
        novelSettings.filter,
        currentPage,
      ] as const;

      let chapterCount = getChapterCount(novel.id, currentPage);

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
        _setChapters([]);
        const sourcePage = await fetchPage(pluginId, path, currentPage);
        const sourceChapters = sourcePage.chapters.map(ch => {
          return {
            ...ch,
            page: currentPage,
          };
        });
        await insertChapters(novel.id, sourceChapters);
        newChapters = await _getPageChapters(...config);
        chapterCount = getChapterCount(novel.id, currentPage);
      }

      setBatchInformation({
        batch: 0,
        total: Math.floor(chapterCount / 300),
        totalChapters: chapterCount,
      });
      setChapters(newChapters);
    }
  }, [
    loading,
    novel.id,
    novelSettings.sort,
    novelSettings.filter,
    currentPage,
    setBatchInformation,
    setChapters,
    _setChapters,
    pluginId,
    path,
  ]);

  useEffect(() => {
    if (loading) return;

    getChapters()
      .catch(e => {
        // eslint-disable-next-line no-console
        if (__DEV__) console.error(e);

        showToast(e.message);
      })
      .finally(() => {
        setFetching(false);
      });
  }, [getChapters, loading]);

  const contextValue = useMemo(
    () => ({
      chapters,
      fetching,
      batchInformation,
      setChapters,
      getChapters,
      extendChapters,
      mutateChapters,
      updateChapter,
      setFetching,
      setBatchInformation,
    }),
    [
      batchInformation,
      chapters,
      extendChapters,
      fetching,
      getChapters,
      mutateChapters,
      setChapters,
      updateChapter,
    ],
  );

  return (
    <NovelChaptersContext.Provider value={contextValue}>
      {children}
    </NovelChaptersContext.Provider>
  );
}
