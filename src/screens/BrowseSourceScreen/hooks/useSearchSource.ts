import {useCallback, useState} from 'react';
import {sourceManager} from '../../../sources/sourceManager';
import {SourceNovelItem} from '../../../sources/types';

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
        if (err instanceof Error) {
          setSearchError(err.message);
        }
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
