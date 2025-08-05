import React from 'react';
import { RouteProp } from '@react-navigation/native';
import { ReaderStackParamList } from '@navigators/types';
import { NovelStateContextProvider } from './context/NovelStateContext';
import { NovelChaptersContextProvider } from './context/NovelChaptersContext';
import { NovelPageContextProvider } from './context/NovelPageContext';
import { NovelSettingsContextProvider } from './context/NovelSettingsContext';
import { NovelLastReadContextProvider } from './context/NovelLastReadContext';
import { HeightContextProvider } from './context/HeightsContext';
import { NovelChapterCacheContextProvider } from './context/NovelChapterCacheContext';

export function NovelProvider({
  children,

  route,
}: {
  children: React.JSX.Element;

  route:
    | RouteProp<ReaderStackParamList, 'Novel'>
    | RouteProp<ReaderStackParamList, 'Chapter'>;
}) {
  const RouteNovelParams =
    'novel' in route.params ? route.params.novel : route.params;

  return (
    <HeightContextProvider>
      <NovelStateContextProvider novelParams={RouteNovelParams}>
        <NovelChaptersContextProvider>
          <NovelChapterCacheContextProvider>
            <NovelPageContextProvider>
              <NovelLastReadContextProvider
                path={RouteNovelParams.path}
                pluginId={RouteNovelParams.pluginId}
              >
                <NovelSettingsContextProvider
                  path={RouteNovelParams.path}
                  pluginId={RouteNovelParams.pluginId}
                >
                  {children}
                </NovelSettingsContextProvider>
              </NovelLastReadContextProvider>
            </NovelPageContextProvider>
          </NovelChapterCacheContextProvider>
        </NovelChaptersContextProvider>
      </NovelStateContextProvider>
    </HeightContextProvider>
  );
}
