// src/hooks/library/useLibraryActions.ts
import { useCallback } from 'react';
import { switchNovelToLibraryQuery } from '@database/queries/NovelQueries';

interface UseLibraryActionsOptions {
  refreshCategories: () => Promise<void>;
  refetchNovels: () => Promise<void>;
}

export const useLibraryActions = ({
  refreshCategories,
  refetchNovels,
}: UseLibraryActionsOptions) => {
  const switchNovelToLibrary = useCallback(
    async (novelPath: string, pluginId: string) => {
      try {
        await switchNovelToLibraryQuery(novelPath, pluginId);
        await Promise.all([refreshCategories(), refetchNovels()]);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to switch novel to library:', error);
      }
    },
    [refreshCategories, refetchNovels],
  );

  return {
    switchNovelToLibrary,
  };
};
