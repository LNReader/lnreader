import { useCallback, useState } from 'react';

import { getUpdatesFromDb } from '../database/queries/UpdateQueries';

import { useFocusEffect } from '@react-navigation/native';
import { Update } from '../database/types';
import { useDownloadQueue } from '../redux/hooks';

const useUpdates = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [searchResults, setSearchResults] = useState<Update[]>([]);

  const downloadQueue = useDownloadQueue();

  const [error, setError] = useState('');

  const getUpdates = async () => {
    try {
      const res = await getUpdatesFromDb();
      setUpdates(res);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const searchUpdates = useCallback(
    async (searchText: string) => {
      setSearchResults(
        updates.filter(item =>
          item.novelName.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    },
    [updates],
  );

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    getUpdates();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUpdates();
    }, [downloadQueue]),
  );

  return {
    isLoading,
    updates,
    searchResults,
    clearSearchResults,
    searchUpdates,
    error,
  };
};

export default useUpdates;
