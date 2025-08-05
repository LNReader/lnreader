/* eslint-disable no-console */
import { NovelChaptersContext } from '@screens/novel/context/NovelChaptersContext';
import { useCallback, useContext, useEffect, useMemo } from 'react';
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
  insertChapters,
  getChapterCount,
  getPageChaptersBatched,
  updateChapterProgress as _updateChapterProgress,
} from '@database/queries/ChapterQueries';
import { ChapterInfo } from '@database/types';
import { fetchPage } from '@services/plugin/fetch';
import { getString } from '@strings/translations';
import { showToast } from '@utils/showToast';
import useNovelState from './useNovelState';
import useNovelPages from './useNovelPages';
import { useMMKVObject } from 'react-native-mmkv';
import { NovelSettings } from './useNovel';
import { useAppSettings } from '../useSettings';

export const NOVEL_SETTINSG_PREFIX = 'NOVEL_SETTINGS';
const defaultNovelSettings: NovelSettings = {
  showChapterTitles: true,
};

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
    setChapters,
    _setChapters,
    extendChapters,
    mutateChapters,
    setFetching,
    setBatchInformation,
  } = NovelChapters;
  const { novel, path, pluginId } = useNovelState();
  const { pages, pageIndex } = useNovelPages();
  const { defaultChapterSort } = useAppSettings();
  const currentPage = pages[pageIndex];

  const [novelSettings = defaultNovelSettings] = useMMKVObject<NovelSettings>(
    `${NOVEL_SETTINSG_PREFIX}_${pluginId}_${path}`,
  );

  const settingsSort = novelSettings.sort || defaultChapterSort;

  const getChapters = useCallback(async () => {
    if (novel && currentPage) {
      let newChapters: ChapterInfo[] = [];

      const config = [
        novel.id,
        settingsSort,
        novelSettings.filter,
        currentPage,
      ] as const;

      let chapterCount = getChapterCount(novel.id, currentPage);

      if (chapterCount) {
        try {
          newChapters = getPageChaptersBatched(...config) || [];
        } catch (error) {
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
    novel,
    currentPage,
    settingsSort,
    novelSettings.filter,
    setBatchInformation,
    setChapters,
    _setChapters,
    pluginId,
    path,
  ]);

  const getNextChapterBatch = useCallback(() => {
    const page = pages[pageIndex];
    const nextBatch = batchInformation.batch + 1;
    if (novel && page && nextBatch <= batchInformation.total) {
      let newChapters: ChapterInfo[] = [];

      try {
        newChapters =
          getPageChaptersBatched(
            novel.id,
            settingsSort,
            novelSettings.filter,
            page,
            nextBatch,
          ) || [];
      } catch (error) {
        console.error('teaser', error);
      }
      setBatchInformation({ ...batchInformation, batch: nextBatch });
      extendChapters(newChapters);
    }
  }, [
    batchInformation,
    extendChapters,
    novel,
    novelSettings.filter,
    pageIndex,
    pages,
    setBatchInformation,
    settingsSort,
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
      if (novel) {
        _markPreviuschaptersRead(chapterId, novel.id);
        mutateChapters(chs =>
          chs.map(chapter =>
            chapter.id <= chapterId ? { ...chapter, unread: false } : chapter,
          ),
        );
      }
    },
    [mutateChapters, novel],
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
      if (novel) {
        _markPreviousChaptersUnread(chapterId, novel.id);
        mutateChapters(chs =>
          chs.map(chapter =>
            chapter.id <= chapterId ? { ...chapter, unread: true } : chapter,
          ),
        );
      }
    },
    [mutateChapters, novel],
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
    (_chapter: ChapterInfo) => {
      if (novel) {
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
    [mutateChapters, novel],
  );

  const deleteChapters = useCallback(
    (_chaters: ChapterInfo[]) => {
      if (novel) {
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
    [novel, mutateChapters],
  );

  const refreshChapters = useCallback(() => {
    if (novel?.id && !fetching) {
      _getPageChapters(
        novel.id,
        settingsSort,
        novelSettings.filter,
        currentPage,
      ).then(chs => {
        setChapters(chs);
      });
    }
  }, [
    novel?.id,
    fetching,
    settingsSort,
    novelSettings.filter,
    currentPage,
    setChapters,
  ]);

  // #endregion
  useEffect(() => {
    if (novel === undefined) return;
    setFetching(true);
    getChapters()
      .catch(e => {
        if (__DEV__) console.error(e);

        showToast(e.message);
        setFetching(false);
      })
      .finally(() => {
        setFetching(false);
      });
  }, [getChapters, novel, setFetching]);

  const result = useMemo(
    () => ({
      chapters,
      getChapters,
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
    }),
    [
      bookmarkChapters,
      chapters,
      deleteChapter,
      deleteChapters,
      getChapters,
      getNextChapterBatch,
      markChapterRead,
      markChaptersRead,
      markChaptersUnread,
      markPreviousChaptersUnread,
      markPreviouschaptersRead,
      refreshChapters,
      updateChapterProgress,
    ],
  );

  return result;
};

export default useNovelChapters;
