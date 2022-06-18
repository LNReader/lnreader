import { useCallback, useState } from 'react';

const useSearch = (defaultSearchText?: string) => {
  const [searchText, setSearchText] = useState<string>(defaultSearchText || '');
  const clearSearchbar = useCallback(() => setSearchText(''), []);

  return { searchText, setSearchText, clearSearchbar };
};

export default useSearch;
