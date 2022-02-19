import {useState, useEffect, useCallback, useRef} from 'react';
import {useSourcesReducer} from '../../../../redux/hooks';

import {sourceManager} from '../../../../sources/sourceManager';
import {Source, SourceNovelItem} from '../../../../sources/types';

export interface GlobalSearchResult {
  sourceId: number;
  sourceName: string;
  lang: string;
  isNsfw?: boolean;
  novels: SourceNovelItem[];
  loading: boolean;
  error: string | null;
}

export const useGlobalSearch = () => {
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [error, setError] = useState<string>();
  const [progress, setProgress] = useState<number>(0);

  const isScreenMounted = useRef(true);
  const {allSources, pinnedSources: pinnedSourceIds} = useSourcesReducer();

  const isPinned = (sourceId: number) => pinnedSourceIds.indexOf(sourceId) > -1;

  const pinnedSources = allSources.filter(source => isPinned(source.id));

  const searchNovel = useCallback(
    async (searchText: string) => {
      setSearchResults(
        pinnedSources.map((source: Source) => ({
          sourceId: source.id,
          sourceName: source.name,
          lang: source.lang,
          isNsfw: source.isNsfw,
          loading: true,
          novels: [],
          error: null,
        })),
      );

      pinnedSources.map(async source => {
        if (isScreenMounted.current === true) {
          try {
            const sourceNovels = await sourceManager(source.id).searchNovels(
              encodeURI(searchText),
            );

            setSearchResults(prevState =>
              prevState.map(sourceItem =>
                sourceItem.sourceId === source.id
                  ? {...sourceItem, novels: sourceNovels, loading: false}
                  : {...sourceItem},
              ),
            );
          } catch (err: any) {
            setSearchResults(prevState =>
              prevState.map(sourceItem =>
                sourceItem.sourceId === source.id
                  ? {
                      ...sourceItem,
                      loading: false,
                      error: err.message,
                    }
                  : sourceItem,
              ),
            );
          } finally {
            setProgress(prevState => prevState + 1 / pinnedSources.length);
          }
        }
      });
    },

    [],
  );

  const clearSearchResults = () => setSearchResults([]);

  /**
   * On screen unmount
   */
  useEffect(() => {
    return () => {
      isScreenMounted.current = false;
    };
  }, []);

  return {searchResults, searchNovel, clearSearchResults, progress, error};
};
