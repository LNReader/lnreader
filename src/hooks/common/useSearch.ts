import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

const useSearch = (defaultSearchText?: string, clearSearchOnUnfocus = true) => {
  const isFocused = useIsFocused();

  const [searchText, setSearchText] = useState<string>(defaultSearchText || '');

  const clearSearchbar = useCallback(() => setSearchText(''), []);

  useEffect(() => {
    if (clearSearchOnUnfocus) {
      if (!isFocused) {
        clearSearchbar();
      }
    }
  }, [isFocused, clearSearchbar]);

  return { searchText, setSearchText, clearSearchbar };
};

export default useSearch;
