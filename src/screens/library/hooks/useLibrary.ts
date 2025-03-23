import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getCategoriesFromDb } from '@database/queries/CategoryQueries';
import {
  getLibraryWithCategory,
  getLibraryNovelsFromDb,
} from '@database/queries/LibraryQueries';

import { Category, LibraryNovelInfo, NovelInfo } from '@database/types';

import { useLibrarySettings } from '@hooks/persisted';
import { LibrarySortOrder } from '../constants/constants';

type Library = Category & { novels: LibraryNovelInfo[] };
export type ExtendedCategory = Category & { novelIds: Number[] };

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
    console.time('g');

    if (searchText) {
      setIsLoading(true);
    }

    const [categories, novels] = await Promise.all([
      getCategoriesFromDb(),
      getLibraryNovelsFromDb(sortOrder, filter, searchText, downloadedOnlyMode),
      // getLibraryNovelsFromDb(),
    ]);
    console.log(categories, novels);
    // console.log(n);

    // const res = categories.map(category => ({
    //   ...category,
    //   novels: novels.filter(novel => novel.category === category.name),
    // }));

    const res = categories.map(c => ({
      ...c,
      novelIds: (c.novelIds ?? '').split(',').map(Number),
    }));
    console.log('res', res);

    setCategories(res);
    setLibrary(novels);
    setIsLoading(false);
    console.timeEnd('g');
  }, [downloadedOnlyMode, filter, searchText, sortOrder]);

  useFocusEffect(() => {
    console.log('h');

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
