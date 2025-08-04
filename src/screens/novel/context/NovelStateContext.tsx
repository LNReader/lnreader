import { NovelInfo } from '@database/types';
import { ReaderStackParamList } from '@navigators/types';
import { RouteProp } from '@react-navigation/native';
import { createContext, useMemo, useState } from 'react';

type Route =
  | RouteProp<ReaderStackParamList, 'Novel'>['params']
  | RouteProp<ReaderStackParamList, 'Chapter'>['params']['novel'];
type Path = Route['path'];
type PluginId = Route['pluginId'];

interface NovelState {
  novel: NovelInfo | undefined;
  loading: boolean; // for novel loading only
  path: Path;
  pluginId: PluginId;
}

interface NovelActions {
  setNovel: (novel: NovelInfo) => void;
  setLoading: (loading: boolean) => void;
}

export const NovelStateContext = createContext<
  (NovelState & NovelActions) | null
>(null);

export function NovelStateContextProvider({
  children,
  path,
  pluginId,
}: {
  children: React.JSX.Element;
  path: Path;
  pluginId: PluginId;
}) {
  const [novel, setNovel] = useState<NovelInfo | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const contextValue = useMemo(
    () => ({
      novel,
      loading,
      path,
      pluginId,
      setNovel,
      setLoading,
    }),
    [loading, novel, path, pluginId],
  );

  return (
    <NovelStateContext.Provider value={contextValue}>
      {children}
    </NovelStateContext.Provider>
  );
}
