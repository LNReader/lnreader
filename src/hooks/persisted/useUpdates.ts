import { useCallback, useMemo, useState } from 'react';
import {
  getDetailedUpdatesFromDb,
  getUpdatedOverviewFromDb,
} from '@database/queries/ChapterQueries';

import { Update, UpdateOverview } from '@database/types';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import dayjs from 'dayjs';
import { parseChapterNumber } from '@utils/parseChapterNumber';
import { useFocusEffect } from '@react-navigation/native';

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
  const [updatesOverview, setUpdatesOverview] = useState<UpdateOverview[]>([]);

  const { lastUpdateTime, showLastUpdateTime, setLastUpdateTime } =
    useLastUpdate();
  const [error, setError] = useState('');

  const getDetailedUpdates = useCallback(
    async (novelId: number, onlyDownloadedChapters: boolean = false) => {
      setIsLoading(true);

      let result: Update[] = await getDetailedUpdatesFromDb(
        novelId,
        onlyDownloadedChapters,
      );
      result = result.map(update => {
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
      });
      setIsLoading(false);
      return result;
    },
    [],
  );

  const getUpdates = useCallback(async () => {
    setIsLoading(true);
    getUpdatedOverviewFromDb()
      .then(res => {
        setUpdatesOverview(res);
        if (res.length) {
          if (
            !lastUpdateTime ||
            dayjs(lastUpdateTime).isBefore(dayjs(res[0].updateDate))
          ) {
            setLastUpdateTime(res[0].updateDate);
          }
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [lastUpdateTime, setLastUpdateTime]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      //? Push updates to the end of the stack to avoid lag
      setTimeout(async () => {
        await getUpdates();
        setIsLoading(false);
      }, 0);
    }, [getUpdates]),
  );

  return useMemo(
    () => ({
      isLoading,
      updatesOverview,
      getUpdates,
      getDetailedUpdates,
      lastUpdateTime,
      showLastUpdateTime,
      error,
    }),
    [
      isLoading,
      updatesOverview,
      getUpdates,
      getDetailedUpdates,
      lastUpdateTime,
      showLastUpdateTime,
      error,
    ],
  );
};
