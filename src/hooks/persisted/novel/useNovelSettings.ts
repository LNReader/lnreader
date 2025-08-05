import { NovelSettingsContext } from '@screens/novel/context/NovelSettingsContext';
import { useCallback, useContext, useMemo } from 'react';

const useNovelSettings = () => {
  const novelPage = useContext(NovelSettingsContext);
  if (!novelPage) {
    throw new Error(
      'useNovelState must be used within NovelSettingsContextProvider',
    );
  }
  const { novelSettings, setNovelSettings } = novelPage;

  const sortAndFilterChapters = useCallback(
    async (sort?: string, filter?: string) => {
      setNovelSettings({
        showChapterTitles: novelSettings?.showChapterTitles,
        sort,
        filter,
      });
    },
    [novelSettings?.showChapterTitles, setNovelSettings],
  );

  const setShowChapterTitles = useCallback(
    (v: boolean) => {
      setNovelSettings({ ...novelSettings, showChapterTitles: v });
    },
    [novelSettings, setNovelSettings],
  );

  const result = useMemo(
    () => ({
      novelSettings,
      sortAndFilterChapters,
      setShowChapterTitles,
    }),
    [novelSettings, setShowChapterTitles, sortAndFilterChapters],
  );

  return result;
};

export default useNovelSettings;
