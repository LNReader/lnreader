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
      <NovelPageContextProvider>
        <NovelSettingsContextProvider
          path={RouteNovelParams.path}
          pluginId={RouteNovelParams.pluginId}
        >
          <NovelStateContextProvider novelParams={RouteNovelParams}>
            <NovelChaptersContextProvider>
              <NovelChapterCacheContextProvider>
                <NovelLastReadContextProvider
                  path={RouteNovelParams.path}
                  pluginId={RouteNovelParams.pluginId}
                >
                  {children}
                </NovelLastReadContextProvider>
              </NovelChapterCacheContextProvider>
            </NovelChaptersContextProvider>
          </NovelStateContextProvider>
        </NovelSettingsContextProvider>
      </NovelPageContextProvider>
    </HeightContextProvider>
  );
}
