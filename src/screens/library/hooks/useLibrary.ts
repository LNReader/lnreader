import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getCategoriesFromDb } from '../../../database/queries/CategoryQueries';
import { getLibrary as getLibraryFromDb } from '../../../database/queries/LibraryQueries';

import { Category, LibraryNovelInfo } from 'src/database/types';

import { useLibrarySettings } from '@hooks/useSettings';
import { LibrarySortOrder } from '../constants/constants';

type Library = Category & { novels: LibraryNovelInfo[] };

export const useLibrary = ({ searchText }: { searchText?: string }) => {
  const {
    filter,
    sortOrder = LibrarySortOrder.DateAdded_DESC,
    downloadedOnlyMode = false,
  } = useLibrarySettings();

  const [library, setLibrary] = useState<Library[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getLibrary = async () => {
    setIsLoading(true);

    const categories = await getCategoriesFromDb();
    const novels = await getLibraryFromDb({
      searchText,
      filter,
      sortOrder,
      downloadedOnlyMode,
    });

    const res = categories.map(category => ({
      ...category,
      novels: novels.filter(novel =>
        JSON.parse(novel.categoryIds).includes(category.id),
      ),
    }));

    // Remove default category if empty
    if (res.length > 1 && !res[0].novels.length) {
      res.shift();
    }

    setLibrary(res);
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      getLibrary();
    }, [searchText, filter, sortOrder, downloadedOnlyMode]),
  );

  return { library, isLoading, refetchLibrary: getLibrary };
};

export const useLibraryNovels = () => {
  const [library, setLibrary] = useState<LibraryNovelInfo[]>([]);

  const getLibrary = async () => {
    const novels = await getLibraryFromDb({});

    setLibrary(novels);
  };

  useFocusEffect(
    useCallback(() => {
      getLibrary();
    }, []),
  );

  return { library };
};
