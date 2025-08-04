import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getCategoriesFromDb } from '@database/queries/CategoryQueries';
import { getLibraryNovelsFromDb } from '@database/queries/LibraryQueries';

import { Category, NovelInfo } from '@database/types';

import { switchNovelToLibraryQuery } from '@database/queries/NovelQueries';
import { useSettingsContext } from '@components/Context/SettingsContext';

// type Library = Category & { novels: LibraryNovelInfo[] };
export type ExtendedCategory = Category & { novelIds: number[] };
export type UseLibraryReturnType = {
  library: NovelInfo[];
  categories: ExtendedCategory[];
  isLoading: boolean;
  setCategories: React.Dispatch<React.SetStateAction<ExtendedCategory[]>>;
  refreshCategories: () => Promise<void>;
  setLibrary: React.Dispatch<React.SetStateAction<NovelInfo[]>>;
  novelInLibrary: (pluginId: string, novelPath: string) => boolean;
  switchNovelToLibrary: (novelPath: string, pluginId: string) => Promise<void>;
  refetchLibrary: () => void;
  setLibrarySearchText: (text: string) => void;
};

export const useLibrary = (): UseLibraryReturnType => {
  const { filter, sortOrder, downloadedOnlyMode } = useSettingsContext();

  const [library, setLibrary] = useState<NovelInfo[]>([]);
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const refreshCategories = useCallback(async () => {
    const dbCategories = getCategoriesFromDb();

    const res = dbCategories.map(c => ({
      ...c,
      novelIds: (c.novelIds ?? '').split(',').map(Number),
    }));

    setCategories(res);
  }, []);

  const getLibrary = useCallback(async () => {
    if (searchText) {
      setIsLoading(true);
    }

    const [_, novels] = await Promise.all([
      refreshCategories(),
      getLibraryNovelsFromDb(sortOrder, filter, searchText, downloadedOnlyMode),
    ]);

    setLibrary(novels);
    setIsLoading(false);
  }, [downloadedOnlyMode, filter, refreshCategories, searchText, sortOrder]);

  const novelInLibrary = useCallback(
    (pluginId: string, novelPath: string) =>
      library?.some(
        novel => novel.pluginId === pluginId && novel.path === novelPath,
      ),
    [library],
  );

  const switchNovelToLibrary = useCallback(
    async (novelPath: string, pluginId: string) => {
      await switchNovelToLibraryQuery(novelPath, pluginId);

      // Important to get correct chapters count
      // Count is set by sql trigger
      refreshCategories();
      const novels = getLibraryNovelsFromDb(
        sortOrder,
        filter,
        searchText,
        downloadedOnlyMode,
      );

      setLibrary(novels);
    },
    [downloadedOnlyMode, filter, refreshCategories, searchText, sortOrder],
  );

  useFocusEffect(() => {
    getLibrary();
  });

  return {
    library,
    categories,
    isLoading,
    setLibrary,
    setCategories,
    refreshCategories,
    novelInLibrary,
    switchNovelToLibrary,
    refetchLibrary: getLibrary,
    setLibrarySearchText: setSearchText,
  };
};

export const useLibraryNovels = () => {
  const [library, setLibrary] = useState<NovelInfo[]>([]);

  const getLibrary = async () => {
    const novels = getLibraryNovelsFromDb();

    setLibrary(novels);
  };

  useFocusEffect(
    useCallback(() => {
      getLibrary();
    }, []),
  );

  return { library, setLibrary };
};
