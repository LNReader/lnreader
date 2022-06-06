import { useState, useEffect, useCallback, useRef } from 'react';
import { sourceManager } from '../../sources/sourceManager';
import { SourceNovelItem } from '../../sources/types';

export const useBrowseSource = (sourceId: number) => {
  const [isLoading, setIsLoading] = useState(true);
  const [novels, setNovels] = useState<SourceNovelItem[]>([]);
  const [error, setError] = useState<string>();

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const isScreenMounted = useRef(true);

  const hasNextPage = currentPage <= totalPages;

  const fetchNovels = useCallback(
    async (page: number) => {
      if (isScreenMounted.current === true) {
        try {
          const res = await sourceManager(sourceId).popularNovels(page);
          setNovels(prevState => [...prevState, ...res.novels]);
          setTotalPages(res.totalPages);
        } catch (err: unknown) {
          setError(`Error: ${err}`);
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
    fetchNovels(currentPage);
  }, [fetchNovels, currentPage]);

  /**
   * On screen unmount
   */
  useEffect(() => {
    return () => {
      isScreenMounted.current = false;
    };
  }, []);

  return { isLoading, novels, hasNextPage, fetchNextPage, error };
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
        setSearchError(`Error: ${err}`);
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
