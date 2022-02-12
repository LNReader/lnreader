import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';

import {History} from '../../../database/types';
import {
  deleteAllHistory,
  deleteChapterHistory,
  getHistoryFromDb,
} from '../../../database/queries/HistoryQueries';

const useHistory = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<History[]>([]);
  const [error, setError] = useState<string>();

  const getHistory = async () => {
    try {
      const res = await getHistoryFromDb();
      setHistory(res);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllHistory = () => deleteAllHistory();

  const removeChapterFromHistory = async (historyId: number) => {
    deleteChapterHistory(historyId);
    getHistory();
  };

  useFocusEffect(
    useCallback(() => {
      getHistory();
    }, []),
  );
  return {isLoading, history, error, removeChapterFromHistory, clearAllHistory};
};

export default useHistory;
