import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

interface UseSearchOptions {
  clearSearchTextOnUnfocus: boolean;
}

const useSearch = (defaultSearchText?: string, options?: UseSearchOptions) => {
  const isFocused = useIsFocused();
  const clearSearchTextOnUnfocus = options?.clearSearchTextOnUnfocus ?? true;

  const [searchText, setSearchText] = useState<string>(defaultSearchText || '');

  const clearSearchbar = useCallback(() => setSearchText(''), []);

  useEffect(() => {
    if (!isFocused && clearSearchTextOnUnfocus) {
      clearSearchbar();
    }
  }, [isFocused, clearSearchbar]);

  return { searchText, setSearchText, clearSearchbar };
};

export default useSearch;
