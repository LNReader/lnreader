import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getCategoriesFromDb } from '@database/queries/CategoryQueries';
import { getLibraryNovelsFromDb } from '@database/queries/LibraryQueries';

import { Category, NovelInfo } from '@database/types';

import { useLibrarySettings } from '@hooks/persisted';
import { LibrarySortOrder } from '../constants/constants';

// type Library = Category & { novels: LibraryNovelInfo[] };
export type ExtendedCategory = Category & { novelIds: number[] };

export const useLibrary = () => {
  const {
    filter,
    sortOrder = LibrarySortOrder.DateAdded_DESC,
    downloadedOnlyMode = false,
  } = useLibrarySettings();

  const [library, setLibrary] = useState<NovelInfo[]>([]);
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const getLibrary = useCallback(async () => {
    if (searchText) {
      setIsLoading(true);
    }

    const [categories, novels] = await Promise.all([
      getCategoriesFromDb(),
      getLibraryNovelsFromDb(sortOrder, filter, searchText, downloadedOnlyMode),
      // getLibraryNovelsFromDb(),
    ]);

    const res = categories.map(c => ({
      ...c,
      novelIds: (c.novelIds ?? '').split(',').map(Number),
    }));

    setCategories(res);
    setLibrary(novels);
    setIsLoading(false);
  }, [downloadedOnlyMode, filter, searchText, sortOrder]);

  useFocusEffect(() => {
    getLibrary();
  });

  return {
    library,
    categories,
    isLoading,
    refetchLibrary: getLibrary,
    setLibrarySearchText: setSearchText,
  };
};

export const useLibraryNovels = () => {
  const [library, setLibrary] = useState<NovelInfo[]>([]);

  const getLibrary = async () => {
    const novels = getLibraryNovelsFromDb();

    setLibrary(novels);
  };

  useFocusEffect(
    useCallback(() => {
      getLibrary();
    }, []),
  );

  return { library, setLibrary };
};
