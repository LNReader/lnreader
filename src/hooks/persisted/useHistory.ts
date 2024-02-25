import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { History } from '@database/types';

import {
  deleteAllHistory,
  deleteChapterHistory,
  getHistoryFromDb,
} from '@database/queries/HistoryQueries';
import dayjs from 'dayjs';
import { parseChapterNumber } from '@utils/parseChapterNumber';

const useHistory = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<History[]>([]);
  const [error, setError] = useState<string>();

  const getHistory = () =>
    getHistoryFromDb()
      .then(res =>
        setHistory(
          res.map(history => {
            const parsedTime = dayjs(history.releaseTime);
            return {
              ...history,
              releaseTime: parsedTime.isValid()
                ? parsedTime.format('LL')
                : history.releaseTime,
              chapterNumber: history.chapterNumber
                ? history.chapterNumber
                : parseChapterNumber(history.novelName, history.name),
            };
          }),
        ),
      )
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));

  const clearAllHistory = () => {
    deleteAllHistory();
    getHistory();
  };

  const removeChapterFromHistory = async (chapterId: number) => {
    deleteChapterHistory(chapterId);
    getHistory();
  };

  useFocusEffect(
    useCallback(() => {
      getHistory();
    }, []),
  );

  return {
    isLoading,
    history,
    error,
    removeChapterFromHistory,
    clearAllHistory,
  };
};

export default useHistory;
