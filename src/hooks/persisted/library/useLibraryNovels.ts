// src/hooks/library/useLibraryNovels.ts
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getLibraryNovelsFromDb } from '@database/queries/LibraryQueries';
import { NovelInfo } from '@database/types';
import {
  LibraryFilter,
  LibrarySortOrder,
} from '../../../screens/library/constants/constants';

interface UseLibraryNovelsOptions {
  sortOrder?: LibrarySortOrder;
  filter?: LibraryFilter;
  searchText: string;
  downloadedOnlyMode?: boolean;
}

export const useLibraryNovels = ({
  sortOrder,
  filter,
  searchText,
  downloadedOnlyMode = false,
}: UseLibraryNovelsOptions) => {
  const [novels, setNovels] = useState<NovelInfo[]>([]);
  const [novelsLoading, setNovelsLoading] = useState(true);

  const fetchNovels = useCallback(async () => {
    setNovelsLoading(true);
    try {
      const fetchedNovels = await getLibraryNovelsFromDb({
        sortOrder,
        filter,
        searchText,
        downloadedOnlyMode,
      });
      setNovels(fetchedNovels);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch library novels:', error);
    } finally {
      setNovelsLoading(false);
    }
  }, [downloadedOnlyMode, filter, searchText, sortOrder]);

  const fetchNovel = useCallback(async (novelId: number) => {
    setNovelsLoading(true);
    try {
      const fetchedNovels = await getLibraryNovelsFromDb({
        filter: `id = ${novelId}`,
      });
      setNovels(prevNovels => {
        const novelIndex = prevNovels.findIndex(novel => novel?.id === novelId);

        if (novelIndex !== -1) {
          prevNovels[novelIndex] = fetchedNovels[0];
        }
        return prevNovels;
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch library novels:', error);
    } finally {
      setNovelsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNovels();
    }, [fetchNovels]),
  );

  return {
    novels,
    novelsLoading,
    refetchNovels: fetchNovels,
    refetchNovel: fetchNovel,
  };
};
