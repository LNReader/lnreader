import { useCallback, useEffect, useRef, useState } from 'react';

import { NovelItem, PluginItem } from '@plugins/types';
import { getPlugin } from '@plugins/pluginManager';
import { useBrowseSettings, usePlugins } from '@hooks/persisted';
import { useFocusEffect } from '@react-navigation/native';

interface Props {
  defaultSearchText?: string;
}

export interface GlobalSearchResult {
  isLoading: boolean;
  plugin: PluginItem;
  novels: NovelItem[];
  error?: string | null;
}

export const useGlobalSearch = ({ defaultSearchText }: Props) => {
  const isMounted = useRef(true); //if user closes the search screen, cancel the search
  const isFocused = useRef(true); //if the user opens a sub-screen (e.g. novel screen), pause the search
  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );
  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;

      return () => (isFocused.current = false);
    }, []),
  );

  const { filteredInstalledPlugins } = usePlugins();

  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [progress, setProgress] = useState(0);

  const { globalSearchConcurrency = 1 } = useBrowseSettings();

  const globalSearch = (searchText: string) => {
    const defaultResult: GlobalSearchResult[] = filteredInstalledPlugins.map(
      plugin => ({
        isLoading: true,
        plugin,
        novels: [],
        error: null,
      }),
    );

    setSearchResults(defaultResult.sort(novelResultSorter));

    let running = 0;

    async function searchInPlugin(_plugin: PluginItem) {
      try {
        const plugin = getPlugin(_plugin.id);
        if (!plugin) {
          throw new Error(`Unknown plugin: ${_plugin.id}`);
        }
        const res = await plugin.searchNovels(searchText, 1);

        setSearchResults(prevState =>
          prevState
            .map(prevResult =>
              prevResult.plugin.id === plugin.id
                ? { ...prevResult, novels: res, isLoading: false }
                : { ...prevResult },
            )
            .sort(novelResultSorter),
        );
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        setSearchResults(prevState =>
          prevState
            .map(prevResult =>
              prevResult.plugin.id === _plugin.id
                ? {
                    ...prevResult,
                    novels: [],
                    isLoading: false,
                    error: errorMessage,
                  }
                : { ...prevResult },
            )
            .sort(novelResultSorter),
        );
      } finally {
        setProgress(
          prevState => prevState + 1 / filteredInstalledPlugins.length,
        );
      }
    }

    //Sort so we load the plugins results in the same order as they show on the list
    let filteredSortedInstalledPlugins = [...filteredInstalledPlugins].sort(
      (a, b) => a.name.localeCompare(b.name),
    );

    (async () => {
      if (globalSearchConcurrency > 1) {
        for (let _plugin of filteredSortedInstalledPlugins) {
          while (running >= globalSearchConcurrency || !isFocused.current) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          if (!isMounted.current) {
            break;
          }
          running++;
          searchInPlugin(_plugin)
            .then(() => {
              running--;
            })
            .catch(() => {
              running--;
            });
        }
      } else {
        for (let _plugin of filteredSortedInstalledPlugins) {
          if (!isMounted.current) {
            break;
          }
          while (!isFocused.current) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          await searchInPlugin(_plugin);
        }
      }
    })();
  };

  useEffect(() => {
    if (defaultSearchText) {
      globalSearch(defaultSearchText);
    }
  }, []);

  return { searchResults, globalSearch, progress };
};

function novelResultSorter(
  { novels: a, plugin: { name: aName } }: GlobalSearchResult,
  { novels: b, plugin: { name: bName } }: GlobalSearchResult,
) {
  if (!a.length && !b.length) {
    return aName.localeCompare(bName);
  }
  if (!a.length) {
    return 1;
  }
  if (!b.length) {
    return -1;
  }

  return aName.localeCompare(bName);
}
