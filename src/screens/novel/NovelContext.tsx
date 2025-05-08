import React, { createContext, useContext, useRef } from 'react';
import { useNovel } from '@hooks/persisted';
import { RouteProp } from '@react-navigation/native';
import { ReaderStackParamList } from '@navigators/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeviceOrientation } from '@hooks/index';

type NovelContextType = ReturnType<typeof useNovel> & {
  navigationBarHeight: number;
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

  const { bottom } = useSafeAreaInsets();
  const orientation = useDeviceOrientation();
  const NavigationBarHeight = useRef(bottom);
  if (bottom < NavigationBarHeight.current && orientation === 'landscape') {
    NavigationBarHeight.current = bottom;
  } else if (bottom > NavigationBarHeight.current) {
    NavigationBarHeight.current = bottom;
  }

  return (
    <NovelContext.Provider
      value={{
        ...novelHookContent,
        navigationBarHeight: NavigationBarHeight.current,
      }}
    >
      {children}
    </NovelContext.Provider>
  );
}

export const useNovelContext = () => {
  const context = useContext(NovelContext);
  return context;
};
