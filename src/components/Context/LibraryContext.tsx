import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from 'react';

// Import existing settings hook

import { DBNovelInfo } from '@database/types';
import {
  ExtendedCategory,
  useFetchCategories,
} from '@hooks/persisted/library/useCategories';
import { useLibraryNovels } from '@hooks/persisted/library/useLibraryNovels';
import { useLibraryActions } from '@hooks/persisted/library/useLibraryActions';
import ServiceManager, { QueuedBackgroundTask } from '@services/ServiceManager';
import { SettingsContextType, useSettingsContext } from './SettingsContext';

type LibraryContextType = {
  library: DBNovelInfo[];
  categories: ExtendedCategory[];
  isLoading: boolean;
  settings: SettingsContextType;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  refetchLibrary: () => void;
  novelInLibrary: (pluginId: string, novelPath: string) => boolean;
  switchNovelToLibrary: (novelPath: string, pluginId: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
  setCategories: React.Dispatch<React.SetStateAction<ExtendedCategory[]>>;
};

const LibraryContext = createContext<LibraryContextType | null>(null);

interface LibraryContextProviderProps {
  children: React.ReactNode;
}

export function LibraryContextProvider({
  children,
}: LibraryContextProviderProps) {
  const settings = useSettingsContext();

  const { categories, categoriesLoading, refreshCategories, setCategories } =
    useFetchCategories();
  const {
    novels,
    novelsLoading,
    refetchNovels,
    refetchNovel,
    searchText,
    setSearchText,
    clearSearchbar,
  } = useLibraryNovels({
    sortOrder: settings.sortOrder,
    filter: settings.filter,
    downloadedOnlyMode: settings.downloadedOnlyMode,
  });

  const { switchNovelToLibrary } = useLibraryActions({
    refreshCategories,
    refetchNovels,
  });

  const isLoading = categoriesLoading || novelsLoading;

  const refetchLibrary = useCallback(async () => {
    await Promise.all([refreshCategories(), refetchNovels()]);
  }, [refreshCategories, refetchNovels]);

  const novelInLibrary = useCallback(
    (pluginId: string, novelPath: string) =>
      novels?.some(
        novel => novel.pluginId === pluginId && novel.path === novelPath,
      ),
    [novels],
  );

  const handleQueueChange = useCallback(
    (task: QueuedBackgroundTask) => {
      if (task.meta.finalStatus !== 'completed') return;
      if (task.task.name === 'IMPORT_EPUB') {
        refetchLibrary();
      } else if (task.task.name === 'DOWNLOAD_CHAPTER') {
        refetchNovel(task.task.data.novelId);
      }
    },
    [refetchLibrary, refetchNovel],
  );
  useEffect(() => {
    ServiceManager.manager.addCompletionListener(handleQueueChange);
    return () => {
      ServiceManager.manager.removeCompletionListener(handleQueueChange);
    };
  }, [handleQueueChange]);

  const contextValue = useMemo(
    () => ({
      library: novels,
      categories,
      isLoading,
      settings,
      searchText,
      refetchLibrary,
      novelInLibrary,
      switchNovelToLibrary,
      setSearchText,
      refreshCategories,
      setCategories,
      clearSearchbar,
    }),
    [
      novels,
      categories,
      isLoading,
      settings,
      searchText,
      refetchLibrary,
      novelInLibrary,
      switchNovelToLibrary,
      setSearchText,
      refreshCategories,
      setCategories,
      clearSearchbar,
    ],
  );

  return (
    <LibraryContext.Provider value={contextValue}>
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibraryContext = (): LibraryContextType => {
  const context = useContext(LibraryContext);
  if (context === null) {
    throw new Error(
      'useLibraryContext must be used within a LibraryContextProvider',
    );
  }
  return context;
};
