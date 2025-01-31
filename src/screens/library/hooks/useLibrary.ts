import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getCategoriesFromDb } from '@database/queries/CategoryQueries';
import {
  getLibraryNovelsFromDb,
  getLibraryWithCategory,
} from '@database/queries/LibraryQueries';

import { Category, LibraryNovelInfo, NovelInfo } from '@database/types';

import { useLibrarySettings } from '@hooks/persisted';
import { LibrarySortOrder } from '../constants/constants';

type Library = Category & { novels: LibraryNovelInfo[] };

export const useLibrary = ({ searchText }: { searchText?: string }) => {
  const {
    filter,
    sortOrderId = 0,
    downloadedOnlyMode = false,
  } = useLibrarySettings();

  const [library, setLibrary] = useState<Library[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getLibrary = async () => {
    if (searchText) {
      setIsLoading(true);
    }

    const [categories, novels] = await Promise.all([
      getCategoriesFromDb(),
      getLibraryWithCategory({
        searchText,
        filter,
        downloadedOnlyMode,
      }),
    ]);

    const res = categories.map(category => ({
      ...category,
      novels: novels
        .filter(novel => novel.category === category.name)
        .sort(
          sortNovelsBy(
            category.id,
            category.sortContents || LibrarySortOrder.DateAdded_DESC,
          ),
        ),
    }));

    setLibrary(res);
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      getLibrary();
    }, [searchText, filter, sortOrderId, downloadedOnlyMode]),
  );

  return { library, isLoading, refetchLibrary: getLibrary };
};

export const useLibraryNovels = () => {
  const [library, setLibrary] = useState<NovelInfo[]>([]);

  const getLibrary = async () => {
    const novels = await getLibraryNovelsFromDb();

    setLibrary(novels);
  };

  useFocusEffect(
    useCallback(() => {
      getLibrary();
    }, []),
  );

  return { library, setLibrary };
};

export const sortTable = new Map();

function sortNovelsBy(categoryId: number, order: LibrarySortOrder) {
  let sortData = sortTable.get(categoryId);
  if (!sortData) {
    sortData = new Map();
    sortTable.set(categoryId, sortData);
  }

  const [field, direction] = order.split(' ');
  const isAsc = direction === 'ASC';

  return (n1: LibraryNovelInfo, n2: LibraryNovelInfo) => {
    // @ts-ignore
    let d1 = n1[field];
    // @ts-ignore
    let d2 = n2[field];

    if (order == LibrarySortOrder.RANDOM) {
      d1 = sortData.get(n1.id);
      d2 = sortData.get(n2.id);
      if (!d1) {
        d1 = Math.random();
        sortData.set(n1.id, d1);
      }
      if (!d2) {
        d2 = Math.random();
        sortData.set(n2.id, d2);
      }
    }

    if (!isAsc) {
      [d1, d2] = [d2, d1];
    }

    if (typeof d1 === 'string') {
      return d1.localeCompare(d2);
    }

    return d1 - d2;
  };
}
