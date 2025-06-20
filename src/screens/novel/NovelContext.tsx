import React, { createContext, useContext, useMemo, useRef } from 'react';
import { useNovel } from '@hooks/persisted';
import { RouteProp } from '@react-navigation/native';
import { ReaderStackParamList } from '@navigators/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NovelContextType = ReturnType<typeof useNovel> & {
  navigationBarHeight: number;
  statusBarHeight: number;
  chapterTextCache: Map<number, string | Promise<string>>;
};

const defaultValue = {} as NovelContextType;

const NovelContext = createContext<NovelContextType>(defaultValue);

export function NovelContextProvider({
  children,

  route,
}: {
  children: React.JSX.Element;

  route:
    | RouteProp<ReaderStackParamList, 'Novel'>
    | RouteProp<ReaderStackParamList, 'Chapter'>;
}) {
  const { path, pluginId } =
    'novel' in route.params ? route.params.novel : route.params;

  const novelHookContent = useNovel(
    'id' in route.params ? route.params : path,
    pluginId,
  );

  const { top, bottom } = useSafeAreaInsets();
  const chapterTextCache = useRef<Map<number, string | Promise<string>>>(
    new Map(),
  );

  // Use safeareainset directly since navigationbar state is accounted for
  const navigationBarHeight = bottom;
  const statusBarHeight = top;
  const contextValue = useMemo(
    () => ({
      ...novelHookContent,
      navigationBarHeight,
      statusBarHeight,
      chapterTextCache: chapterTextCache.current,
    }),
    [novelHookContent, navigationBarHeight, statusBarHeight],
  );
  return (
    <NovelContext.Provider value={contextValue}>
      {children}
    </NovelContext.Provider>
  );
}

export const useNovelContext = () => {
  const context = useContext(NovelContext);
  return context;
};
