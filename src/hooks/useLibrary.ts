import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { LibraryNovelInfo } from '../database/types';
import { getLibraryNovelsFromDb } from '../database/queries/LibraryQueries';
import { useLibrarySettings } from '../redux/hooks';

const useLibrary = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [novels, setNovels] = useState<LibraryNovelInfo[]>([]);
  const [error, setError] = useState<string>();

  const { filters, sort } = useLibrarySettings();

  const getLibraryNovels = useCallback(async () => {
    try {
      const res = await getLibraryNovelsFromDb(filters, sort);
      setNovels(res);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, sort]);

  const getLibrarySearchResults = useCallback(
    async (searchText: string) => {
      try {
        const res = await getLibraryNovelsFromDb(filters, sort, searchText);
        setNovels(res);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [filters, sort],
  );

  const clearSearchResults = () => getLibraryNovels();

  useFocusEffect(
    useCallback(() => {
      getLibraryNovels();
    }, [getLibraryNovels]),
  );
  return {
    isLoading,
    novels,
    error,
    getLibrarySearchResults,
    clearSearchResults,
    getLibraryNovels,
  };
};

export default useLibrary;
