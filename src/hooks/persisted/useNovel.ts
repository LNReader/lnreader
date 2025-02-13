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
  getPageChaptersTeaser,
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

export const useNovel = (novelPath: string, pluginId: string) => {
  const [loading, setLoading] = useState(true);
  const [novel, setNovel] = useState<NovelInfo>();
  const [chapters, _setChapters] = useState<ChapterInfo[]>([]);
  const [chaptersTeasers, _setChaptersTeasers] = useState<ChapterInfo[]>([]);
  const [pages, setPages] = useState<string[]>([]);
  const { defaultChapterSort } = useAppSettings();

  const [pageIndex = defaultPageIndex, setPageIndex] = useMMKVNumber(`
    ${NOVEL_PAGE_INDEX_PREFIX}_${pluginId}_${novelPath}
    `);
  const [lastRead, setLastRead] = useMMKVObject<ChapterInfo>(
    `${LAST_READ_PREFIX}_${pluginId}_${novelPath}`,
  );
  const [novelSettings = defaultNovelSettings, setNovelSettings] =
    useMMKVObject<NovelSettings>(
      `${NOVEL_SETTINSG_PREFIX}_${pluginId}_${novelPath}`,
    );

  const settingsSort = novelSettings.sort || defaultChapterSort;

  // #endregion
  // #region setters

  const mutateChapters = useCallback(
    (mutation: (chs: ChapterInfo[]) => ChapterInfo[]) => {
      if (novel) {
        _setChapters(mutation);
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

  const setChapters = useCallback(
    (chs: ChapterInfo[]) => {
      if (novel) {
        _setChapters(
          chs.map(chapter => {
            const parsedTime = dayjs(chapter.releaseTime);
            return {
              ...chapter,
              releaseTime: parsedTime.isValid()
                ? parsedTime.format('LL')
                : chapter.releaseTime,
              chapterNumber: chapter.chapterNumber
                ? chapter.chapterNumber
                : parseChapterNumber(novel.name, chapter.name),
            };
          }),
        );
      }
    },
    [novel, _setChapters],
  );

  const setChaptersTeasers = useCallback(
    (chs: ChapterInfo[]) => {
      if (novel) {
        _setChaptersTeasers(
          chs.map(chapter => {
            const parsedTime = dayjs(chapter.releaseTime);
            return {
              ...chapter,
              releaseTime: parsedTime.isValid()
                ? parsedTime.format('LL')
                : chapter.releaseTime,
              chapterNumber: chapter.chapterNumber
                ? chapter.chapterNumber
                : parseChapterNumber(novel.name, chapter.name),
            };
          }),
        );
      }
    },
    [novel, _setChaptersTeasers],
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
    const start = new Date().getTime();
    console.log('getNovel', start);

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
    let tmpPages: string[];
    if (tmpNovel.totalPages > 0) {
      tmpPages = Array(tmpNovel.totalPages)
        .fill(0)
        .map((_, idx) => String(idx + 1));
    } else {
      // for some reason getCustomPages async takes between 10-20s
      tmpPages = getCustomPages(tmpNovel.id).map(c => c.page);
    }
    if (tmpPages.length) {
      setPages(tmpPages);
    } else {
      setPages(['1']);
    }
    const end = new Date().getTime();
    console.log('getNovel done', end, end - start);

    setNovel(tmpNovel);
  }, [novelPath, pluginId]);

  const getChapters = useCallback(async () => {
    const page = pages[pageIndex];
    if (novel && page) {
      let newChapters: ChapterInfo[] = [];
      let teaser: ChapterInfo[] = [];
      let teaser2: ChapterInfo[] = [];

      const config = [
        novel.id,
        settingsSort,
        novelSettings.filter,
        page,
      ] as const;

      const chapterCount = getChapterCount(novel.id, page);

      if (chapterCount) {
        teaser = getPageChaptersTeaser(...config) || [];
        setChaptersTeasers(teaser);

        teaser2 = (await _getPageChapters(...config, 10, 90)) || [];
        setChaptersTeasers(teaser2);

        newChapters =
          (await _getPageChapters(...config, 100, chapterCount).catch(e =>
            console.error('_getPageChapters failed:', e),
          )) || [];
      }
      // Fetch next page if no chapters
      else if (Number(page)) {
        const sourcePage = await fetchPage(pluginId, novelPath, page);
        const sourceChapters = sourcePage.chapters.map(ch => {
          return {
            ...ch,
            page,
          };
        });
        await insertChapters(novel.id, sourceChapters);
        newChapters = await _getPageChapters(...config);
      }

      setChapters([...teaser, ...teaser2, ...newChapters]);
      setChaptersTeasers([]);
    }
  }, [
    novel,
    novelPath,
    novelSettings.filter,
    pageIndex,
    pages,
    pluginId,
    setChapters,
    setChaptersTeasers,
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
    if (novel && chapters.length === 0) {
      _getPageChapters(
        novel.id,
        settingsSort,
        novelSettings.filter,
        pages[pageIndex],
      ).then(chs => setChapters(chs));
    }
  }, [
    novel,
    chapters.length,
    settingsSort,
    novelSettings.filter,
    pages,
    pageIndex,
    setChapters,
  ]);

  // #endregion
  // #region useEffects

  useEffect(() => {
    getNovel().finally(() => {
      //? Sometimes loading state changes doesn't trigger rerender causing NovelScreen to be in endless loading state
      setLoading(false);
      // getNovel();
    });
  }, [getNovel]);

  useEffect(() => {
    if (novel === undefined) return;

    getChapters().catch(e => showToast(e.message));
  }, [getChapters, novel]);

  // #endregion

  return {
    loading,
    pageIndex,
    pages,
    novel,
    lastRead,
    chapters,
    novelSettings,
    chaptersTeasers,
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
