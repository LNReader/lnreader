/* eslint-disable no-console */
import { NovelChaptersContext } from '@screens/novel/context/NovelChaptersContext';
import { useCallback, useContext, useMemo } from 'react';
import {
  bookmarkChapter as _bookmarkChapter,
  markChapterRead as _markChapterRead,
  markChaptersRead as _markChaptersRead,
  markPreviuschaptersRead as _markPreviuschaptersRead,
  markPreviousChaptersUnread as _markPreviousChaptersUnread,
  markChaptersUnread as _markChaptersUnread,
  deleteChapter as _deleteChapter,
  deleteChapters as _deleteChapters,
  getPageChapters as _getPageChapters,
  getPageChaptersBatched,
  updateChapterProgress as _updateChapterProgress,
} from '@database/queries/ChapterQueries';
import { ChapterInfo } from '@database/types';
import { getString } from '@strings/translations';
import { showToast } from '@utils/showToast';
import useNovelState from './useNovelState';
import useNovelPages from './useNovelPages';
import useNovelSettings from './useNovelSettings';

const useNovelChapters = () => {
  const NovelChapters = useContext(NovelChaptersContext);
  if (!NovelChapters) {
    throw new Error(
      'useNovelChapters must be used within NovelChaptersContextProvider',
    );
  }
  const {
    chapters,
    fetching,
    batchInformation,
    sortAndFilterChapters,
    setChapters,
    getChapters,
    updateChapter,
    extendChapters,
    mutateChapters,
  } = NovelChapters;
  const { novel, loading } = useNovelState();
  const { pages, pageIndex, page } = useNovelPages();
  const { novelSettings } = useNovelSettings();
  const currentPage = pages[pageIndex];

  const getNextChapterBatch = useCallback(() => {
    const nextBatch = batchInformation.batch + 1;
    if (!loading && page && nextBatch <= batchInformation.total) {
      let newChapters: ChapterInfo[] = [];

      try {
        newChapters =
          getPageChaptersBatched(
            novel.id,
            novel.name,
            novelSettings.sort,
            novelSettings.filter,
            page,
            nextBatch,
          ) || [];
      } catch (error) {
        console.error('teaser', error);
      }
      extendChapters(newChapters, { ...batchInformation, batch: nextBatch });
    }
  }, [
    batchInformation,
    loading,
    page,
    extendChapters,
    novel.id,
    novel.name,
    novelSettings.sort,
    novelSettings.filter,
  ]);

  // #region Mark chapters

  const bookmarkChapters = useCallback(
    (_chapters: ChapterInfo[]) => {
      _chapters.map(_chapter => {
        _bookmarkChapter(_chapter.id);
      });
      mutateChapters(chs =>
        chs.map(chapter => {
          if (_chapters.some(_c => _c.id === chapter.id)) {
            return {
              ...chapter,
              bookmark: !chapter.bookmark,
            };
          }
          return chapter;
        }),
      );
    },
    [mutateChapters],
  );

  const markPreviouschaptersRead = useCallback(
    (chapterId: number) => {
      if (!loading) {
        _markPreviuschaptersRead(chapterId, novel.id);
        mutateChapters(chs =>
          chs.map(chapter =>
            chapter.id <= chapterId ? { ...chapter, unread: false } : chapter,
          ),
        );
      }
    },
    [loading, mutateChapters, novel.id],
  );

  const markChapterRead = useCallback(
    (chapterId: number) => {
      _markChapterRead(chapterId);

      mutateChapters(chs =>
        chs.map(c => {
          if (c.id !== chapterId) {
            return c;
          }
          return {
            ...c,
            unread: false,
          };
        }),
      );
    },
    [mutateChapters],
  );

  const updateChapterProgress = useCallback(
    (chapterId: number, progress: number) => {
      _updateChapterProgress(chapterId, Math.min(progress, 100));

      mutateChapters(chs =>
        chs.map(c => {
          if (c.id !== chapterId) {
            return c;
          }
          return {
            ...c,
            progress,
          };
        }),
      );
    },
    [mutateChapters],
  );

  const markChaptersRead = useCallback(
    (_chapters: ChapterInfo[]) => {
      const chapterIds = _chapters.map(chapter => chapter.id);
      _markChaptersRead(chapterIds);

      mutateChapters(chs =>
        chs.map(chapter => {
          if (chapterIds.includes(chapter.id)) {
            return {
              ...chapter,
              unread: false,
            };
          }
          return chapter;
        }),
      );
    },
    [mutateChapters],
  );

  const markPreviousChaptersUnread = useCallback(
    (chapterId: number) => {
      if (!loading) {
        _markPreviousChaptersUnread(chapterId, novel.id);
        mutateChapters(chs =>
          chs.map(chapter =>
            chapter.id <= chapterId ? { ...chapter, unread: true } : chapter,
          ),
        );
      }
    },
    [loading, mutateChapters, novel.id],
  );

  const markChaptersUnread = useCallback(
    (_chapters: ChapterInfo[]) => {
      const chapterIds = _chapters.map(chapter => chapter.id);
      _markChaptersUnread(chapterIds);

      mutateChapters(chs =>
        chs.map(chapter => {
          if (chapterIds.includes(chapter.id)) {
            return {
              ...chapter,
              unread: true,
            };
          }
          return chapter;
        }),
      );
    },
    [mutateChapters],
  );

  // #endregion
  // #region refresh and delete

  const deleteChapter = useCallback(
    async (_chapter: ChapterInfo) => {
      if (!loading) {
        _deleteChapter(novel.pluginId, novel.id, _chapter.id).then(() => {
          mutateChapters(chs =>
            chs.map(chapter => {
              if (chapter.id !== _chapter.id) {
                return chapter;
              }
              return {
                ...chapter,
                isDownloaded: false,
              };
            }),
          );
          showToast(getString('common.deleted', { name: _chapter.name }));
        });
      }
    },
    [loading, mutateChapters, novel.id, novel.pluginId],
  );

  const deleteChapters = useCallback(
    (_chaters: ChapterInfo[]) => {
      if (!loading) {
        _deleteChapters(novel.pluginId, novel.id, _chaters).then(() => {
          showToast(
            getString('updatesScreen.deletedChapters', {
              num: _chaters.length,
            }),
          );
          mutateChapters(chs =>
            chs.map(chapter => {
              if (_chaters.some(_c => _c.id === chapter.id)) {
                return {
                  ...chapter,
                  isDownloaded: false,
                };
              }
              return chapter;
            }),
          );
        });
      }
    },
    [loading, novel.pluginId, novel.id, mutateChapters],
  );

  const refreshChapters = useCallback(() => {
    if (!loading && !fetching) {
      _getPageChapters(
        novel.id,
        novel.name,
        novelSettings.sort,
        novelSettings.filter,
        currentPage,
      ).then(chs => {
        setChapters(chs, { ...batchInformation });
      });
    }
  }, [
    loading,
    fetching,
    novel.id,
    novel.name,
    novelSettings.sort,
    novelSettings.filter,
    currentPage,
    setChapters,
    batchInformation,
  ]);

  // #endregion

  const result = useMemo(
    () => ({
      chapters,
      fetching,
      batchInformation,
      getChapters,
      updateChapter,
      getNextChapterBatch,
      bookmarkChapters,
      markPreviouschaptersRead,
      markChapterRead,
      updateChapterProgress,
      markChaptersRead,
      markPreviousChaptersUnread,
      markChaptersUnread,
      deleteChapter,
      deleteChapters,
      refreshChapters,
      sortAndFilterChapters,
    }),
    [
      chapters,
      fetching,
      batchInformation,
      getChapters,
      updateChapter,
      getNextChapterBatch,
      bookmarkChapters,
      markPreviouschaptersRead,
      markChapterRead,
      updateChapterProgress,
      markChaptersRead,
      markPreviousChaptersUnread,
      markChaptersUnread,
      deleteChapter,
      deleteChapters,
      refreshChapters,
      sortAndFilterChapters,
    ],
  );

  return result;
};

export default useNovelChapters;
