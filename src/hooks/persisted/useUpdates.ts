import { useCallback, useState } from 'react';
import { getUpdatesFromDb } from '@database/queries/ChapterQueries';

import { useFocusEffect } from '@react-navigation/native';
import { Update } from '@database/types';
import { useDownloadQueue } from '@redux/hooks';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import dayjs from 'dayjs';

export const SHOW_LAST_UPDATE_TIME = 'SHOW_LAST_UPDATE_TIME';
export const LAST_UPDATE_TIME = 'LAST_UPDATE_TIME';

export const useLastUpdate = () => {
  const [showLastUpdateTime = true, setShowLastUpdateTime] = useMMKVBoolean(
    SHOW_LAST_UPDATE_TIME,
  );
  const [lastUpdateTime, setLastUpdateTime] = useMMKVString(LAST_UPDATE_TIME);
  return {
    lastUpdateTime,
    showLastUpdateTime,
    setLastUpdateTime,
    setShowLastUpdateTime,
  };
};

export const useUpdates = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [searchResults, setSearchResults] = useState<Update[]>([]);

  const { lastUpdateTime, showLastUpdateTime, setLastUpdateTime } =
    useLastUpdate();
  const { downloadQueue } = useDownloadQueue();

  const [error, setError] = useState('');

  const getUpdates = () =>
    getUpdatesFromDb()
      .then(res => {
        setUpdates(res);
        if (res.length) {
          if (
            !lastUpdateTime ||
            dayjs(lastUpdateTime).isBefore(dayjs(res[0].updatedTime))
          ) {
            setLastUpdateTime(res[0].updatedTime);
          }
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));

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
    lastUpdateTime,
    showLastUpdateTime,
    error,
  };
};
