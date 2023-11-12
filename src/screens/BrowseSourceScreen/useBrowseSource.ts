import { useState, useEffect, useCallback, useRef } from 'react';

import SourceFactory from '@sourcesV2/SourceFactory';
import { SelectedFilters, SourceFilter, SourceNovel } from '@sourcesV2/types';

export const useBrowseSource = (
  sourceId: number,
  showLatestNovels?: boolean,
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [novels, setNovels] = useState<SourceNovel[]>([]);
  const [error, setError] = useState<string>();

  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] = useState<SourceFilter[]>();
  const [selectedFilters, setSelectedFilters] = useState<
    SelectedFilters | undefined
  >();
  const [hasNextPage, setHasNextPage] = useState(true);

  const isScreenMounted = useRef(true);

  const fetchNovels = useCallback(
    async (page: number, filters?: SelectedFilters) => {
      if (isScreenMounted.current === true) {
        try {
          const source = SourceFactory.getSource(sourceId);
          const res = await source?.getPopoularNovels?.({
            page,
            // showLatestNovels,
            filters,
          });
          setNovels(prevState =>
            page === 1 ? res?.novels : [...prevState, ...res?.novels],
          );
          if (!res?.novels.length) {
            setHasNextPage(false);
          }
          setFilterValues(source?.filters);
        } catch (err: unknown) {
          setError(`${err}`);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [sourceId],
  );

  const fetchNextPage = () => {
    hasNextPage && setCurrentPage(prevState => prevState + 1);
  };

  useEffect(() => {
    fetchNovels(currentPage, selectedFilters);
  }, [fetchNovels, currentPage]);

  const refetchNovels = () => {
    setCurrentPage(1);
    fetchNovels(1);
  };

  /**
   * On screen unmount
   */
  useEffect(() => {
    return () => {
      isScreenMounted.current = false;
    };
  }, []);

  const clearFilters = useCallback(() => setSelectedFilters(undefined), []);

  const setFilters = (filters?: SelectedFilters) => {
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

export const useSearchSource = (sourceId: number) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SourceNovel[]>([]);
  const [searchError, setSearchError] = useState<string>();

  const searchSource = useCallback(
    async (searchTerm: string) => {
      try {
        setIsSearching(true);
        const res = await SourceFactory.getSource(sourceId)?.getSearchNovels?.({
          searchTerm,
        });
        setSearchResults(res?.novels || []);
      } catch (err) {
        setSearchError(`${err}`);
      } finally {
        setIsSearching(false);
      }
    },
    [sourceId],
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
