import { useState, useEffect, useCallback, useRef } from 'react';
import { SelectedFilter, SourceFilter } from '@plugins/types/filterTypes';
import { NovelItem } from '@plugins/types';

import { getPlugin } from '@plugins/pluginManager';

export const useBrowseSource = (
  pluginId: string,
  showLatestNovels?: boolean,
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [novels, setNovels] = useState<NovelItem[]>([]);
  const [error, setError] = useState<string>();

  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] = useState<SourceFilter[]>();
  const [selectedFilters, setSelectedFilters] = useState<
    SelectedFilter | undefined
  >();
  const [hasNextPage, setHasNextPage] = useState(true);

  const isScreenMounted = useRef(true);

  const fetchNovels = useCallback(
    async (page: number, filters?: SelectedFilter) => {
      if (isScreenMounted.current === true) {
        try {
          const plugin = getPlugin(pluginId);
          const res = await plugin.popularNovels(page, {
            showLatestNovels,
            filters,
          });
          setNovels(prevState => (page === 1 ? res : [...prevState, ...res]));
          if (!res.length) {
            setHasNextPage(false);
          }
          setFilterValues(plugin.filters);
        } catch (err: unknown) {
          setError(`${err}`);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [pluginId],
  );

  const fetchNextPage = () => {
    hasNextPage && setCurrentPage(prevState => prevState + 1);
  };

  /**
   * On screen unmount
   */
  useEffect(() => {
    return () => {
      isScreenMounted.current = false;
    };
  }, []);

  useEffect(() => {
    fetchNovels(currentPage, selectedFilters);
  }, [fetchNovels, currentPage]);

  const refetchNovels = () => {
    setCurrentPage(1);
    fetchNovels(1);
  };

  const clearFilters = useCallback(() => setSelectedFilters(undefined), []);

  const setFilters = (filters?: SelectedFilter) => {
    setIsLoading(true);
    setCurrentPage(1);
    fetchNovels(1, filters);
    setSelectedFilters(filters);
  };

  return {
    isLoading,
    novels,
    hasNextPage,
    fetchNextPage,
    error,
    filterValues,
    setFilters,
    clearFilters,
    refetchNovels,
  };
};

export const useSearchSource = (pluginId: string) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NovelItem[]>([]);
  const [searchError, setSearchError] = useState<string>();

  const searchSource = useCallback(
    async (searchTerm: string) => {
      try {
        setIsSearching(true);
        const res = await getPlugin(pluginId).searchNovels(searchTerm);
        setSearchResults(res);
      } catch (err) {
        setSearchError(`${err}`);
      } finally {
        setIsSearching(false);
      }
    },
    [pluginId],
  );

  const clearSearchResults = useCallback(() => setSearchResults([]), []);

  return {
    isSearching,
    searchResults,
    searchSource,
    clearSearchResults,
    searchError,
  };
};
