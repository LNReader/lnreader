import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getExtendCategories } from '@database/queries/CategoryQueries';
import { getNovelsInLibrary } from '@database/queries/LibraryQueries';

import { Novel, ExtendedCategory } from '@database/types';

import { useLibrarySettings } from '@hooks/useSettings';
import { LibrarySortOrder } from '../constants/constants';

type Library = ExtendedCategory;

export const useLibrary = ({ searchText }: { searchText?: string }) => {
  const {
    filter,
    sortOrder = LibrarySortOrder.DateAdded_DESC,
    downloadedOnlyMode = false,
  } = useLibrarySettings();

  const [library, setLibrary] = useState<Library[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getLibrary = async () => {
    if (searchText) {
      setIsLoading(true);
    }

    const res = await getExtendCategories({
      sortOrder,
      filter,
      searchText,
      downloadedOnlyMode,
    });
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
  const [library, setLibrary] = useState<Novel[]>([]);

  const getLibrary = async () => {
    const novels = await getNovelsInLibrary();
    setLibrary(novels);
  };

  useFocusEffect(
    useCallback(() => {
      getLibrary();
    }, []),
  );

  return { library, setLibrary };
};
