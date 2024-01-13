import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { History } from '@database/types';

import {
  deleteAllHistory,
  deleteChapterHistory,
  getHistoryFromDb,
} from '@database/queries/HistoryQueries';

const useHistory = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<History[]>([]);
  const [error, setError] = useState<string>();

  const getHistory = () =>
    getHistoryFromDb()
      .then(res => setHistory(res))
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
