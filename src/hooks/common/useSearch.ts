import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  }, [clearSearchbar, clearSearchOnUnfocus, isFocused]);

  return useMemo(
    () => ({ searchText, setSearchText, clearSearchbar }),
    [searchText, setSearchText, clearSearchbar],
  );
};

export default useSearch;
