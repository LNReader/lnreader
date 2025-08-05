/* eslint-disable no-console */
import { useMMKVNumber, useMMKVObject } from 'react-native-mmkv';
import { ChapterInfo, NovelInfo } from '@database/types';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import {
  getNovelByPath,
  deleteCachedNovels as _deleteCachedNovels,
  getCachedNovels as _getCachedNovels,
  insertNovelAndChapters,
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
  updateChapterProgress as _updateChapterProgress,
} from '@database/queries/ChapterQueries';
import { fetchNovel, fetchPage } from '@services/plugin/fetch';
import { showToast } from '@utils/showToast';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getString } from '@strings/translations';
import dayjs from 'dayjs';
import { parseChapterNumber } from '@utils/parseChapterNumber';
import { NOVEL_STORAGE } from '@utils/Storages';
import { useAppSettings } from '../useSettings';
import NativeFile from '@specs/NativeFile';
import { useLibraryContext } from '@components/Context/LibraryContext';
import { useSettingsContext } from '@components/Context/SettingsContext';

// #region constants

// store key: '<PREFIX>_<novel.pluginId>_<novel.path>',
// store key: '<PREFIX>_<novel.id>',

export const TRACKED_NOVEL_PREFIX = 'TRACKED_NOVEL_PREFIX';

export const NOVEL_PAGE_INDEX_PREFIX = 'NOVEL_PAGE_INDEX_PREFIX';

export const LAST_READ_PREFIX = 'LAST_READ_PREFIX';

const defaultNovelSettings: NovelSettings = {
  showChapterTitles: true,
};
const defaultPageIndex = 0;

// #endregion
// #region types

export interface NovelSettings {
  sort?: string;
  filter?: string;
  showChapterTitles?: boolean;
}

// #endregion
// #region definition useNovel

export const useNovel = (novelOrPath: string | NovelInfo, pluginId: string) => {
  const { switchNovelToLibrary } = useLibraryContext();
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(true);
  const [novel, setNovel] = useState<NovelInfo | undefined>(
    typeof novelOrPath === 'object' ? novelOrPath : undefined,
  );
  const [pages, setPages] = useState<string[]>(
    novel ? calculatePages(novel) : [],
  );

  const { defaultChapterSort } = useSettingsContext();

  const novelPath = novel?.path ?? (novelOrPath as string);

  const [pageIndex = defaultPageIndex, setPageIndex] = useMMKVNumber(`
    ${NOVEL_PAGE_INDEX_PREFIX}_${pluginId}_${novelPath}
    `);
  const currentPage = pages[pageIndex];

  const [lastRead, setLastRead] = useMMKVObject<ChapterInfo>(
    `${LAST_READ_PREFIX}_${pluginId}_${novelPath}`,
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

  // #endregion
  // #region setters

  const openPage = useCallback(
    (index: number) => {
      setPageIndex(index);
    },
    [setPageIndex],
  );

  const sortAndFilterChapters = useCallback(
    async (sort?: string, filter?: string) => {
      if (novel) {
        setNovelSettings({
          showChapterTitles: novelSettings?.showChapterTitles,
          sort,
          filter,
        });
      }
    },
    [novel, novelSettings?.showChapterTitles, setNovelSettings],
  );

  const setShowChapterTitles = useCallback(
    (v: boolean) => {
      setNovelSettings({ ...novelSettings, showChapterTitles: v });
    },
    [novelSettings, setNovelSettings],
  );

  // #endregion
  // #region getters

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

  // #endregion

  return useMemo(
    () => ({
      loading,
      fetching,
      pageIndex,
      pages,
      novel,
      lastRead,
      chapters,
      novelSettings,
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
      markChapterRead,
      markChaptersRead,
      markPreviousChaptersUnread,
      markChaptersUnread,
      setShowChapterTitles,
      refreshChapters,
      updateChapter,
      updateChapterProgress,
      deleteChapter,
      deleteChapters,
    }),
    [
      loading,
      fetching,
      pageIndex,
      pages,
      novel,
      lastRead,
      chapters,
      novelSettings,
      batchInformation,
      getNextChapterBatch,
      getNovel,
      setPageIndex,
      openPage,
      setLastRead,
      sortAndFilterChapters,
      followNovel,
      bookmarkChapters,
      markPreviouschaptersRead,
      markChapterRead,
      markChaptersRead,
      markPreviousChaptersUnread,
      markChaptersUnread,
      setShowChapterTitles,
      refreshChapters,
      updateChapter,
      updateChapterProgress,
      deleteChapter,
      deleteChapters,
    ],
  );
};

// #region DeleteCachedNovels

export const deleteCachedNovels = async () => {
  const cachedNovels = await _getCachedNovels();
  for (const novel of cachedNovels) {
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
