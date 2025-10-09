import { NovelSettingsContext } from '@screens/novel/context/NovelSettingsContext';
import { useCallback, useContext, useMemo } from 'react';

const useNovelSettings = () => {
  const novelPage = useContext(NovelSettingsContext);
  if (!novelPage) {
    throw new Error(
      'useNovelSettings must be used within NovelSettingsContextProvider',
    );
  }
  const { novelSettings, setNovelSettings } = novelPage;

  const setShowChapterTitles = useCallback(
    (v: boolean) => {
      setNovelSettings({ ...novelSettings, showChapterTitles: v });
    },
    [novelSettings, setNovelSettings],
  );

  const result = useMemo(
    () => ({
      novelSettings,
      setShowChapterTitles,
    }),
    [novelSettings, setShowChapterTitles],
  );

  return result;
};

export default useNovelSettings;
