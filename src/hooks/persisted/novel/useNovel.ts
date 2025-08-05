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

// #endregion
