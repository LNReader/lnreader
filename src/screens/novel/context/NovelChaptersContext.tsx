import { ChapterInfo } from '@database/types';
import useNovelState from '@hooks/persisted/novel/useNovelState';
import { parseChapterNumber } from '@utils/parseChapterNumber';
import dayjs from 'dayjs';
import { createContext, useCallback, useMemo, useState } from 'react';

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
  _setChapters: (chapters: ChapterInfo[]) => void;

  extendChapters: (chapters: ChapterInfo[]) => void;
  mutateChapters: (mutation: (chs: ChapterInfo[]) => ChapterInfo[]) => void;
  updateChapter: (index: number, update: Partial<ChapterInfo>) => void;
  setFetching: (fetching: boolean) => void;
  setBatchInformation: (batch: ChapterState['batchInformation']) => void;
}

export const NovelChaptersContext = createContext<
  (ChapterState & ChapterActions) | null
>(null);

export function NovelStateContextProvider({
  children,
}: {
  children: React.JSX.Element;
}) {
  const { novel } = useNovelState();
  const [chapters, _setChapters] = useState<ChapterInfo[]>([]);
  const [fetching, setFetching] = useState(true);
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

  const contextValue = useMemo(
    () => ({
      chapters,
      fetching,
      batchInformation,
      setChapters,
      _setChapters,
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
