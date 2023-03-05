import { useState, useEffect, useCallback, useRef } from 'react';
import { SelectedFilter, SourceFilter } from '../../sources/types/filterTypes';
import { sourceManager } from '../../sources/sourceManager';
import { SourceNovelItem } from '../../sources/types';

export const useBrowseSource = (
  sourceId: number,
  showLatestNovels?: boolean,
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [novels, setNovels] = useState<SourceNovelItem[]>([]);
  const [error, setError] = useState<string>();

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] = useState<SourceFilter[]>();
  const [selectedFilters, setSelectedFilters] = useState<
    SelectedFilter | undefined
  >();

  const isScreenMounted = useRef(true);

  const hasNextPage = currentPage <= totalPages;

  const fetchNovels = useCallback(
    async (page: number, filters?: SelectedFilter) => {
      if (isScreenMounted.current === true) {
        try {
          const source = sourceManager(sourceId);
          const res = await source.popularNovels(page, {
            showLatestNovels,
            filters,
          });
          setNovels(prevState =>
            page === 1 ? res.novels : [...prevState, ...res.novels],
          );
          setTotalPages(res.totalPages);
          setFilterValues(source.filters);
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

  const setFilters = (filters: SelectedFilter) => {
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
  const [searchResults, setSearchResults] = useState<SourceNovelItem[]>([]);
  const [searchError, setSearchError] = useState<string>();

  const searchSource = useCallback(
    async (searchTerm: string) => {
      try {
        setIsSearching(true);
        const res = await sourceManager(sourceId).searchNovels(searchTerm);
        setSearchResults(res);
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
