import React, { createContext, useContext } from 'react';
import { useNovel } from '@hooks/persisted';
import { RouteProp } from '@react-navigation/native';
import { ReaderStackParamList } from '@navigators/types';

type NovelContextType = ReturnType<typeof useNovel>;

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

  return (
    <NovelContext.Provider value={novelHookContent}>
      {children}
    </NovelContext.Provider>
  );
}

export const useNovelContext = () => {
  const context = useContext(NovelContext);
  return context;
};
