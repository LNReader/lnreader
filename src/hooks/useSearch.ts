import { useCallback, useState } from 'react';

const useSearch = () => {
  const [searchText, setSearchText] = useState<string>('');
  const clearSearchbar = useCallback(() => setSearchText(''), []);

  return { searchText, setSearchText, clearSearchbar };
};

export default useSearch;
