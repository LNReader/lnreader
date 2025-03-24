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
  markChaptersUnread as _markChaptersUnread,
  updateChapterProgress as _updateChapterProgress,
  updateChapterProgressByIds as _updateChapterProgressByIds,
  markPreviousChaptersRead as _markPreviousChaptersRead,
  markPreviousChaptersUnread as _markPreviousChaptersUnread,
  updatePreviousChapterReadProgress as _updatePreviousChapterReadProgress,
  updatePreviousChapterUnreadProgress as _updatePreviousChapterUnreadProgress,
  deleteChapter as _deleteChapter,
  deleteChapters as _deleteChapters,
  getPageChapters as _getPageChapters,
  insertChapters,
  getCustomPages,
} from '@database/queries/ChapterQueries';
import { fetchNovel, fetchPage } from '@services/plugin/fetch';
import { showToast } from '@utils/showToast';
import { useCallback, useEffect, useState } from 'react';
import { getString } from '@strings/translations';
import dayjs from 'dayjs';
import { parseChapterNumber } from '@utils/parseChapterNumber';
import { NOVEL_STORAGE } from '@utils/Storages';
import FileManager from '@native/FileManager';
import { useAppSettings } from './useSettings';
import { getPlugin } from '@plugins/pluginManager';
import { ChapterItem, Plugin } from '@plugins/types';

// store key: '<PREFIX>_<novel.pluginId>_<novel.path>',
// store key: '<PREFIX>_<novel.id>',

export const TRACKED_NOVEL_PREFIX = 'TRACKED_NOVEL_PREFIX';

export const NOVEL_PAGE_INDEX_PREFIX = 'NOVEL_PAGE_INDEX_PREFIX';
export const NOVEL_SETTINSG_PREFIX = 'NOVEL_SETTINGS';
export const LAST_READ_PREFIX = 'LAST_READ_PREFIX';

type TrackedNovel = SearchResult & UserListEntry;

export interface NovelSettings {
  sort?: string;
  filter?: string;
  showChapterTitles?: boolean;
}

const defaultNovelSettings: NovelSettings = {
  showChapterTitles: true,
};
const defaultPageIndex = 0;

export const useTrackedNovel = (novelId: number) => {
  const [trackedNovel, setValue] = useMMKVObject<TrackedNovel>(
    `${TRACKED_NOVEL_PREFIX}_${novelId}`,
  );

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

export const useNovel = (novelPath: string, pluginId: string) => {
  const [loading, setLoading] = useState(true);
  const [novel, setNovel] = useState<NovelInfo>();
  const [chapters, _setChapters] = useState<ChapterInfo[]>([]);
  const [pages, setPages] = useState<string[]>([]);
  const setChapters = useCallback(
    (chapters: ChapterInfo[]) => {
      if (novel) {
        _setChapters(
          chapters.map(chapter => {
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

  const { defaultChapterSort } = useAppSettings();

  const sort = novelSettings.sort || defaultChapterSort;

  const openPage = useCallback((index: number) => {
    setPageIndex(index);
  }, []);

  const refreshChapters = useCallback(() => {
    if (novel) {
      _getPageChapters(
        novel.id,
        sort,
        novelSettings.filter,
        pages[pageIndex],
      ).then(chapters => setChapters(chapters));
    }
  }, [novel, pageIndex, sort, novelSettings]);

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

  const bookmarkChapters = (_chapters: ChapterInfo[]) => {
    _chapters.map(_chapter => {
      _bookmarkChapter(_chapter.id);
    });
    setChapters(
      chapters.map(chapter => {
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

  // Helper function to handle common plugin sync logic
  const syncChapterWithPlugin = async (
    findSyncedChapterCallback: () => ChapterItem | undefined,
    inChapter: boolean = false,
  ) => {
    if (!novel) {
      return;
    }

    const plugin = getPlugin(novel.pluginId);
    if (!plugin?.syncChapter) {
      return;
    }

    const syncedChapter = findSyncedChapterCallback();
    if (syncedChapter) {
      await syncChapterStatus(plugin, syncedChapter, inChapter);
    }
  };

  const syncChapterStatus = async (
    plugin: Plugin,
    chapter: ChapterItem,
    inChapter: boolean,
  ) => {
    if (!plugin.syncChapterStatus) {
      return;
    }

    try {
      const success = await plugin.syncChapterStatus(novelPath, chapter.path);

      if (!inChapter) {
        // Show a toast with the result
        showToast(
          getString(
            success ? 'novelScreen.syncTrue' : 'novelScreen.syncFalse',
            {
              name: chapter.name,
            },
          ),
        );
      }
    } catch (error) {
      if (!inChapter) {
        // Show a toast with the error message
        showToast(
          getString('novelScreen.syncError', {
            name: chapter.name,
            error: error,
          }),
        );
      }
    }
  };

  const markChapterRead = (chapterId: number) => {
    if (!novel) {
      return;
    }

    syncChapterWithPlugin(() =>
      chapters.find(chapter => chapter.id === chapterId),
    );

    _markChapterRead(chapterId);
    _updateChapterProgress(chapterId, 0);

    setChapters(
      chapters.map(chapter => ({
        ...chapter,
        unread: chapter.id === chapterId ? false : chapter.unread,
        progress: chapter.id === chapterId ? 0 : chapter.progress,
      })),
    );
  };

  const markChaptersRead = (_chapters: ChapterInfo[]) => {
    if (!novel) {
      return;
    }

    syncChapterWithPlugin(() => {
      // Sort the selected chapters based on the position (highest position first)
      const sortedChapters = [..._chapters].sort(
        (a, b) => (b.position ?? 0) - (a.position ?? 0),
      );
      return sortedChapters[0]; // Return the chapter with the highest position
    });

    const chapterIds = _chapters.map(chapter => chapter.id);
    _markChaptersRead(chapterIds);
    _updateChapterProgressByIds(chapterIds, 0);

    setChapters(
      chapters.map(chapter => ({
        ...chapter,
        unread: chapterIds.includes(chapter.id) ? false : chapter.unread,
        progress: chapterIds.includes(chapter.id) ? 0 : chapter.progress,
      })),
    );
  };

  const markChaptersUnread = (_chapters: ChapterInfo[]) => {
    if (!novel) {
      return;
    }

    syncChapterWithPlugin(() => {
      // Filter for chapters that are read
      const readChapters = _chapters.filter(chapter => !chapter.unread);

      // Only proceed if there's at least one read chapter
      if (!readChapters.length) {
        return;
      }

      // Sort the selected chapters based on the position (lowest position first)
      const sortedChapters = [...readChapters].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0),
      );

      // Get the first chapter from the sorted list
      const firstChapter = chapters.find(
        chapter => chapter.id === sortedChapters[0]?.id,
      );
      const firstChapterPosition = firstChapter?.position ?? 0;

      // Attempt to find the chapter immediately preceding the first chapter;
      // if not found, fallback to the first chapter itself
      const previousChapter = chapters.find(
        chapter => chapter.position === firstChapterPosition - 1,
      );

      return previousChapter || firstChapter;
    });

    const chapterIds = _chapters.map(chapter => chapter.id);
    _markChaptersUnread(chapterIds);
    _updateChapterProgressByIds(chapterIds, 0);

    setChapters(
      chapters.map(chapter => ({
        ...chapter,
        unread: chapterIds.includes(chapter.id) ? true : chapter.unread,
        progress: chapterIds.includes(chapter.id) ? 0 : chapter.progress,
      })),
    );
  };

  const markPreviousChaptersRead = (chapterId: number) => {
    if (!novel) {
      return;
    }

    syncChapterWithPlugin(() => {
      const chapterPosition = chapters.find(
        chapter => chapter.id === chapterId,
      )?.position;
      return chapters.find(chapter => chapter.position === chapterPosition);
    });

    _markPreviousChaptersRead(chapterId, novel.id);
    _updatePreviousChapterReadProgress(chapterId, novel.id, 0);

    setChapters(
      chapters.map(chapter => ({
        ...chapter,
        unread: chapter.id <= chapterId ? false : chapter.unread,
        progress: chapter.id <= chapterId ? 0 : chapter.progress,
      })),
    );
  };

  const markPreviousChaptersUnread = (chapterId: number) => {
    if (!novel) {
      return;
    }

    syncChapterWithPlugin(() => {
      const currentChapter = chapters.find(chapter => chapter.id === chapterId);
      if (!currentChapter) {
        return;
      }

      const chapterPosition = currentChapter.position ?? 0;
      // Find the previous chapter or fall back to the current chapter
      return (
        chapters.find(chapter => chapter.position === chapterPosition - 1) ||
        currentChapter
      );
    });

    _markPreviousChaptersUnread(chapterId, novel.id);
    _updatePreviousChapterUnreadProgress(chapterId, novel.id, 0);

    setChapters(
      chapters.map(chapter => ({
        ...chapter,
        unread: chapter.id >= chapterId ? true : chapter.unread,
        progress: chapter.id >= chapterId ? 0 : chapter.progress,
      })),
    );
  };

  const deleteChapter = (_chapter: ChapterInfo) => {
    if (novel) {
      _deleteChapter(novel.pluginId, novel.id, _chapter.id).then(() => {
        setChapters(
          chapters.map(chapter => {
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
          setChapters(
            chapters.map(chapter => {
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
    [novel, chapters],
  );

  const getNovel = useCallback(async () => {
    let novel = await getNovelByPath(novelPath, pluginId);
    if (!novel) {
      const sourceNovel = await fetchNovel(pluginId, novelPath).catch(() => {
        throw new Error(getString('updatesScreen.unableToGetNovel'));
      });
      await insertNovelAndChapters(pluginId, sourceNovel);
      novel = await getNovelByPath(novelPath, pluginId);
      if (!novel) {
        return;
      }
    }
    let pages: string[];
    if (novel.totalPages > 0) {
      pages = Array(novel.totalPages)
        .fill(0)
        .map((v, idx) => String(idx + 1));
    } else {
      pages = (await getCustomPages(novel.id)).map(c => c.page);
    }
    if (pages.length) {
      setPages(pages);
    } else {
      setPages(['1']);
    }
    setNovel(novel);
    setLoading(false);
  }, []);

  const getChapters = useCallback(async () => {
    const page = pages[pageIndex];
    if (novel && page) {
      let chapters = await _getPageChapters(
        novel.id,
        sort,
        novelSettings.filter,
        page,
      );
      if (!chapters.length && Number(page)) {
        const sourcePage = await fetchPage(pluginId, novelPath, page);
        const sourceChapters = sourcePage.chapters.map(ch => {
          return {
            ...ch,
            page,
          };
        });
        await insertChapters(novel.id, sourceChapters);
        chapters = await _getPageChapters(
          novel.id,
          sort,
          novelSettings.filter,
          page,
        );
      }
      setChapters(chapters);
    }
  }, [novel, novelSettings, pageIndex]);

  useEffect(() => {
    getNovel();
  }, []);

  useEffect(() => {
    getChapters().catch(e => showToast(e.message));
  }, [getChapters]);

  return {
    loading,
    pageIndex,
    pages,
    novel,
    lastRead,
    chapters,
    novelSettings,
    getNovel,
    setPageIndex,
    openPage,
    setNovel,
    setLastRead,
    sortAndFilterChapters,
    followNovel,
    bookmarkChapters,
    syncChapterWithPlugin,
    markPreviousChaptersRead,
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
    if (await FileManager.exists(novelDir)) {
      await FileManager.unlink(novelDir);
    }
  }
  _deleteCachedNovels();
};
