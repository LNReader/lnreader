/* eslint-disable no-console */
import { SearchResult, UserListEntry } from '@services/Trackers';
import { useMMKVNumber, useMMKVObject } from 'react-native-mmkv';
import { TrackerMetadata, getTracker } from './useTracker';
import { ChapterInfo, NovelInfo } from '@database/types';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import {
  getNovelByPath,
  deleteCachedNovels as _deleteCachedNovels,
  getCachedNovels as _getCachedNovels,
  insertNovelAndChapters,
  switchNovelToLibrary,
} from '@database/queries/NovelQueries';
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
  getCustomPages,
  getChapterCount,
  getPageChaptersBatched,
} from '@database/queries/ChapterQueries';
import { fetchNovel, fetchPage } from '@services/plugin/fetch';
import { showToast } from '@utils/showToast';
import { useCallback, useEffect, useState } from 'react';
import { getString } from '@strings/translations';
import dayjs from 'dayjs';
import { parseChapterNumber } from '@utils/parseChapterNumber';
import { NOVEL_STORAGE } from '@utils/Storages';
import { useAppSettings } from './useSettings';
import NativeFile from '@specs/NativeFile';

// #region constants

// store key: '<PREFIX>_<novel.pluginId>_<novel.path>',
// store key: '<PREFIX>_<novel.id>',

export const TRACKED_NOVEL_PREFIX = 'TRACKED_NOVEL_PREFIX';

export const NOVEL_PAGE_INDEX_PREFIX = 'NOVEL_PAGE_INDEX_PREFIX';
export const NOVEL_SETTINSG_PREFIX = 'NOVEL_SETTINGS';
export const LAST_READ_PREFIX = 'LAST_READ_PREFIX';

const defaultNovelSettings: NovelSettings = {
  showChapterTitles: true,
};
const defaultPageIndex = 0;

// #endregion
// #region types

type TrackedNovel = SearchResult & UserListEntry;

export interface NovelSettings {
  sort?: string;
  filter?: string;
  showChapterTitles?: boolean;
}

// #endregion
// #region definition useTrackedNovel

export const useTrackedNovel = (novelId: number | 'NO_ID') => {
  const [trackedNovel, setValue] = useMMKVObject<TrackedNovel>(
    `${TRACKED_NOVEL_PREFIX}_${novelId}`,
  );
  if (novelId === 'NO_ID') {
    return {
      trackedNovel: undefined,
      trackNovel: () => {},
      untrackNovel: () => {},
      updateTrackedNovel: () => {},
      updateNovelProgess: () => {},
    };
  }

  // #endregion
  // #region trackNovel functions

  const trackNovel = (tracker: TrackerMetadata, novel: SearchResult) => {
    getTracker(tracker.name)
      .getUserListEntry(novel.id, tracker.auth)
      .then((data: UserListEntry) => {
        setValue({
          ...novel,
          ...data,
        });
      });
  };

  const untrackNovel = () => setValue(undefined);

  const updateTrackedNovel = (
    tracker: TrackerMetadata,
    data: Partial<UserListEntry>,
  ) => {
    if (!trackedNovel) {
      return;
    }
    return getTracker(tracker.name).updateUserListEntry(
      trackedNovel.id,
      data,
      tracker.auth,
    );
  };

  const updateNovelProgess = (
    tracker: TrackerMetadata,
    chaptersRead: number,
  ) => {
    if (!trackedNovel) {
      return;
    }
    return getTracker(tracker.name).updateUserListEntry(
      trackedNovel.id,
      { progress: chaptersRead },
      tracker.auth,
    );
  };

  return {
    trackedNovel,
    trackNovel,
    untrackNovel,
    updateTrackedNovel,
    updateNovelProgess,
  };
};

// #endregion
// #region definition useNovel

export const useNovel = (novelOrPath: string | NovelInfo, pluginId: string) => {
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(true);
  const [novel, setNovel] = useState<NovelInfo | undefined>(
    typeof novelOrPath === 'object' ? novelOrPath : undefined,
  );
  const [pages, setPages] = useState<string[]>(
    novel ? calculatePages(novel) : [],
  );
  const [chaptersTeasers, _setChaptersTeasers] = useState<ChapterInfo[]>([]);

  const { defaultChapterSort } = useAppSettings();

  const novelPath = novel?.path ?? (novelOrPath as string);

  const [pageIndex = defaultPageIndex, setPageIndex] = useMMKVNumber(`
    ${NOVEL_PAGE_INDEX_PREFIX}_${pluginId}_${novelPath}
    `);
  const currentPage = pages[pageIndex];

  const [lastRead, setLastRead] = useMMKVObject<ChapterInfo>(
    `${LAST_READ_PREFIX}_${pluginId}_${novelPath}`,
  );
  const [novelSettings = defaultNovelSettings, setNovelSettings] =
    useMMKVObject<NovelSettings>(
      `${NOVEL_SETTINSG_PREFIX}_${pluginId}_${novelPath}`,
    );

  const [chapters, _setChapters] = useState<ChapterInfo[]>([]);
  const [batchInformation, setBatchInformation] = useState<{
    batch: number;
    total: number;
    totalChapters?: number;
  }>(
    typeof novelOrPath === 'object'
      ? {
          batch: 0,
          total: 0,
          totalChapters: getChapterCount(novelOrPath.id, pages[pageIndex]),
        }
      : { batch: 0, total: 0 },
  );

  const settingsSort = novelSettings.sort || defaultChapterSort;
  // #endregion
  // #region setters

  function calculatePages(tmpNovel: NovelInfo) {
    let tmpPages: string[];
    if (tmpNovel.totalPages > 0) {
      tmpPages = Array(tmpNovel.totalPages)
        .fill(0)
        .map((_, idx) => String(idx + 1));
    } else {
      tmpPages = getCustomPages(tmpNovel.id).map(c => c.page);
    }

    return tmpPages.length > 1 ? tmpPages : ['1'];
  }

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

  const openPage = useCallback(
    (index: number) => {
      setPageIndex(index);
    },
    [setPageIndex],
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

  const sortAndFilterChapters = async (sort?: string, filter?: string) => {
    if (novel) {
      setNovelSettings({
        showChapterTitles: novelSettings?.showChapterTitles,
        sort,
        filter,
      });
    }
  };

  const setShowChapterTitles = (v: boolean) => {
    setNovelSettings({ ...novelSettings, showChapterTitles: v });
  };

  const followNovel = () => {
    switchNovelToLibrary(novelPath, pluginId).then(() => {
      if (novel) {
        setNovel({
          ...novel,
          inLibrary: !novel?.inLibrary,
        });
      }
    });
  };

  // #endregion
  // #region getters

  const getNovel = useCallback(async () => {
    let tmpNovel = getNovelByPath(novelPath, pluginId);
    if (!tmpNovel) {
      const sourceNovel = await fetchNovel(pluginId, novelPath).catch(() => {
        throw new Error(getString('updatesScreen.unableToGetNovel'));
      });

      await insertNovelAndChapters(pluginId, sourceNovel);
      tmpNovel = getNovelByPath(novelPath, pluginId);

      if (!tmpNovel) {
        return;
      }
    }
    setPages(calculatePages(tmpNovel));

    setNovel(tmpNovel);
  }, [novelPath, pluginId]);

  const getChapters = useCallback(async () => {
    const page = pages[pageIndex];

    if (novel && page) {
      let newChapters: ChapterInfo[] = [];

      const config = [
        novel.id,
        settingsSort,
        novelSettings.filter,
        page,
      ] as const;

      let chapterCount = getChapterCount(novel.id, page);

      if (chapterCount) {
        try {
          newChapters = getPageChaptersBatched(...config) || [];
        } catch (error) {
          console.error('teaser', error);
        }
      }
      // Fetch next page if no chapters
      else if (Number(page)) {
        _setChapters([]);
        const sourcePage = await fetchPage(pluginId, novelPath, page);
        const sourceChapters = sourcePage.chapters.map(ch => {
          return {
            ...ch,
            page,
          };
        });
        await insertChapters(novel.id, sourceChapters);
        newChapters = await _getPageChapters(...config);
        chapterCount = getChapterCount(novel.id, page);
      }

      setBatchInformation({
        batch: 0,
        total: Math.floor(chapterCount / 100),
        totalChapters: chapterCount,
      });
      setChapters(newChapters);
    }
  }, [
    novel,
    novelPath,
    novelSettings.filter,
    pageIndex,
    pages,
    pluginId,
    setChapters,
    settingsSort,
  ]);

  const getNextChapterBatch = useCallback(() => {
    const page = pages[pageIndex];
    const nextBatch = batchInformation.batch + 1;
    if (novel && page) {
      let newChapters: ChapterInfo[] = [];

      const config = [
        novel.id,
        settingsSort,
        novelSettings.filter,
        page,
      ] as const;

      try {
        newChapters = getPageChaptersBatched(...config, nextBatch) || [];
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
    settingsSort,
  ]);

  // #endregion
  // #region Mark chapters

  const bookmarkChapters = (_chapters: ChapterInfo[]) => {
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
  };

  const markPreviouschaptersRead = (chapterId: number) => {
    if (novel) {
      _markPreviuschaptersRead(chapterId, novel.id);
      mutateChapters(chs =>
        chs.map(chapter =>
          chapter.id <= chapterId ? { ...chapter, unread: false } : chapter,
        ),
      );
    }
  };

  const markChapterRead = (chapterId: number) => {
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
  };

  const markChaptersRead = (_chapters: ChapterInfo[]) => {
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
  };

  const markPreviousChaptersUnread = (chapterId: number) => {
    if (novel) {
      _markPreviousChaptersUnread(chapterId, novel.id);
      mutateChapters(chs =>
        chs.map(chapter =>
          chapter.id <= chapterId ? { ...chapter, unread: true } : chapter,
        ),
      );
    }
  };

  const markChaptersUnread = (_chapters: ChapterInfo[]) => {
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
  };

  // #endregion
  // #region refresh and delete

  const deleteChapter = (_chapter: ChapterInfo) => {
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
  };

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
  // #region useEffects

  useEffect(() => {
    if (novel) {
      setLoading(false);
    } else {
      getNovel().finally(() => {
        //? Sometimes loading state changes doesn't trigger rerender causing NovelScreen to be in endless loading state
        setLoading(false);
        // getNovel();
      });
    }
  }, [getNovel, novel]);

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
  }, [getChapters, novel, novelOrPath]);

  // #endregion

  return {
    loading,
    fetching,
    pageIndex,
    pages,
    novel,
    lastRead,
    chapters,
    novelSettings,
    chaptersTeasers,
    batchInformation,
    getNextChapterBatch,
    getNovel,
    setPageIndex,
    openPage,
    setNovel,
    setLastRead,
    sortAndFilterChapters,
    followNovel,
    bookmarkChapters,
    markPreviouschaptersRead,
    markChaptersRead,
    markPreviousChaptersUnread,
    markChaptersUnread,
    setShowChapterTitles,
    markChapterRead,
    refreshChapters,
    updateChapter,
    deleteChapter,
    deleteChapters,
  };
};

// #region DeleteCachedNovels

export const deleteCachedNovels = async () => {
  const cachedNovels = await _getCachedNovels();
  for (let novel of cachedNovels) {
    MMKVStorage.delete(`${TRACKED_NOVEL_PREFIX}_${novel.id}`);
    MMKVStorage.delete(
      `${NOVEL_PAGE_INDEX_PREFIX}_${novel.pluginId}_${novel.path}`,
    );
    MMKVStorage.delete(
      `${NOVEL_SETTINSG_PREFIX}_${novel.pluginId}_${novel.path}`,
    );
    MMKVStorage.delete(`${LAST_READ_PREFIX}_${novel.pluginId}_${novel.path}`);
    const novelDir = NOVEL_STORAGE + '/' + novel.pluginId + '/' + novel.id;
    if (NativeFile.exists(novelDir)) {
      NativeFile.unlink(novelDir);
    }
  }
  _deleteCachedNovels();
};
// #endregion
