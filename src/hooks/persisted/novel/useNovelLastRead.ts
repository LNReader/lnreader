import { NovelLastReadContext } from '@screens/novel/context/NovelLastReadContext';
import { useContext, useMemo } from 'react';

const useNovelLastRead = () => {
  const novelPage = useContext(NovelLastReadContext);
  if (!novelPage) {
    throw new Error(
      'useNovelState must be used within NovelLastReadContextProvider',
    );
  }
  const { lastRead, setLastRead } = novelPage;

  const result = useMemo(
    () => ({
      lastRead,
      setLastRead,
    }),
    [lastRead, setLastRead],
  );

  return result;
};

export default useNovelLastRead;
