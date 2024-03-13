import { useState, useEffect, useCallback, useRef } from 'react';
import { NovelItem } from '@plugins/types';

import { getPlugin } from '@plugins/pluginManager';
import { FilterToValues, Filters } from '@plugins/types/filterTypes';

export const useBrowseSource = (
  pluginId: string,
  showLatestNovels?: boolean,
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [novels, setNovels] = useState<NovelItem[]>([]);
  const [error, setError] = useState<string>();

  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Filters | undefined>(
    getPlugin(pluginId)?.filters,
  );
  const [selectedFilters, setSelectedFilters] = useState<
    FilterToValues<Filters> | undefined
  >(filterValues);
  const [hasNextPage, setHasNextPage] = useState(true);

  const isScreenMounted = useRef(true);

  const fetchNovels = useCallback(
    async (page: number, filters?: FilterToValues<Filters>) => {
      if (isScreenMounted.current === true) {
        try {
          const plugin = getPlugin(pluginId);
          if (!plugin) {
            throw new Error(`Unknown plugin: ${pluginId}`);
          }
          await plugin
            .popularNovels(page, {
              showLatestNovels,
              filters,
            })
            .then(res => {
              setNovels(prevState =>
                page === 1 ? res : [...prevState, ...res],
              );
              if (!res.length) {
                setHasNextPage(false);
              }
            })
            .catch(error => {
              setError(error.message);
              setHasNextPage(false);
            });
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
    setError('');
    setIsLoading(true);
    setNovels([]);
    setCurrentPage(1);
    fetchNovels(1, selectedFilters);
  };

  const clearFilters = useCallback(
    (filters: Filters) => setSelectedFilters(filters),
    [],
  );

  const setFilters = (filters?: FilterToValues<Filters>) => {
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
  const [hasNextSearchPage, setHasNextSearchPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');

  const searchSource = (searchTerm: string) => {
    setSearchResults([]);
    setHasNextSearchPage(true);
    setCurrentPage(1);
    setSearchText(searchTerm);
    setIsSearching(true);
  };

  const isScreenMounted = useRef(true);

  const fetchNovels = useCallback(
    async (searchText: string, page: number) => {
      if (isScreenMounted.current === true) {
        try {
          const plugin = getPlugin(pluginId);
          if (!plugin) {
            throw new Error(`Unknown plugin: ${pluginId}`);
          }
          const res = await plugin.searchNovels(searchText, page);
          setSearchResults(prevState =>
            page === 1 ? res : [...prevState, ...res],
          );
          if (!res.length) {
            setHasNextSearchPage(false);
          }
        } catch (err: unknown) {
          setSearchError(`${err}`);
          setHasNextSearchPage(false);
        } finally {
          setIsSearching(false);
        }
      }
    },
    [pluginId],
  );

  const searchNextPage = () => {
    hasNextSearchPage && setCurrentPage(prevState => prevState + 1);
  };

  useEffect(() => {
    if (searchText) {
      fetchNovels(searchText, currentPage);
    }
  }, [currentPage, fetchNovels, searchText]);

  const clearSearchResults = useCallback(() => {
    setSearchText('');
    setSearchResults([]);
    setCurrentPage(1);
    setHasNextSearchPage(true);
  }, []);

  return {
    isSearching,
    searchResults,
    hasNextSearchPage,
    searchNextPage,
    searchSource,
    clearSearchResults,
    searchError,
  };
};
