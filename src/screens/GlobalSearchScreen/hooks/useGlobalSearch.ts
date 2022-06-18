import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBrowseSettings, useSourcesReducer } from '@redux/hooks';
import { Source, SourceNovelItem } from '../../../sources/types';
import { sourceManager } from '../../../sources/sourceManager';

interface Props {
  defaultSearchText?: string;
}

export interface GlobalSearchResult {
  isLoading: boolean;
  source: Source;
  novels: SourceNovelItem[];
  error?: string | null;
}

export const useGlobalSearch = ({ defaultSearchText }: Props) => {
  const isMounted = useRef(true);
  const { searchAllSources = false } = useBrowseSettings();

  const { allSources, pinnedSourceIds = [] } = useSourcesReducer();

  const isPinned = useCallback(
    (sourceId: number) => pinnedSourceIds.indexOf(sourceId) > -1,
    [pinnedSourceIds],
  );

  const pinnedSources = useMemo(
    () => allSources.filter(source => isPinned(source.sourceId)),
    [allSources, isPinned],
  );

  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [progress, setProgress] = useState(0);

  const globalSearch = (searchText: string) => {
    const sources = searchAllSources ? allSources : pinnedSources;

    const defaultResult: GlobalSearchResult[] = sources.map(source => ({
      isLoading: true,
      source,
      novels: [],
      error: null,
    }));

    setSearchResults(defaultResult);

    sources.forEach(async source => {
      if (isMounted.current) {
        try {
          const res = await sourceManager(source.sourceId).searchNovels(
            searchText,
          );

          setSearchResults(prevState =>
            prevState.map(prevResult =>
              prevResult.source.sourceId === source.sourceId
                ? { ...prevResult, novels: res, isLoading: false }
                : { ...prevResult },
            ),
          );

          setSearchResults(prevState =>
            prevState.sort(
              (
                { novels: a, source: { sourceName: aName } },
                { novels: b, source: { sourceName: bName } },
              ) => {
                if (!a.length) {
                  return 1;
                }
                if (!b.length) {
                  return -1;
                }

                return aName.localeCompare(bName);
              },
            ),
          );
        } catch (error) {
          setSearchResults(prevState =>
            prevState.map(prevResult =>
              prevResult.source.sourceId === source.sourceId
                ? {
                    ...prevResult,
                    novels: [],
                    isLoading: false,
                    error: error.message,
                  }
                : { ...prevResult },
            ),
          );
        } finally {
          setProgress(prevState => prevState + 1 / sources.length);
        }
      }
    });
  };

  useEffect(() => {
    if (defaultSearchText) {
      globalSearch(defaultSearchText);
    }
  }, []);

  return { searchResults, globalSearch, searchAllSources, progress };
};
