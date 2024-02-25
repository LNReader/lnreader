import { useCallback, useState } from 'react';
import { getUpdatesFromDb } from '@database/queries/ChapterQueries';

import { Update } from '@database/types';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import dayjs from 'dayjs';
import { parseChapterNumber } from '@utils/parseChapterNumber';

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
  const [error, setError] = useState('');

  const getUpdates = () =>
    getUpdatesFromDb()
      .then(res => {
        setUpdates(
          res.map(update => {
            const parsedTime = dayjs(update.releaseTime);
            return {
              ...update,
              releaseTime: parsedTime.isValid()
                ? parsedTime.format('LL')
                : update.releaseTime,
              chapterNumber: update.chapterNumber
                ? update.chapterNumber
                : parseChapterNumber(update.novelName, update.name),
            };
          }),
        );
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

  return {
    isLoading,
    updates,
    searchResults,
    getUpdates,
    clearSearchResults,
    searchUpdates,
    lastUpdateTime,
    showLastUpdateTime,
    error,
  };
};
