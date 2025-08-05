import { NovelInfo } from '@database/types';
import { ReaderStackParamList } from '@navigators/types';
import { RouteProp } from '@react-navigation/native';
import { createContext, useMemo, useState } from 'react';

type Route = RouteProp<ReaderStackParamList, 'Novel'>;
type Params = Route['params'];
type Path = Params['path'];
type PluginId = Params['pluginId'];
export type RouteNovel = Params & {
  id: 'NO_ID';
  inLibrary: boolean;
  isLocal: boolean;
  totalPages: number;
};
interface NovelStateLoading {
  novel: RouteNovel;
  loading: true;
  path: Path;
  pluginId: PluginId;
}
interface NovelState {
  novel: NovelInfo;
  loading: false;
  path: Path;
  pluginId: PluginId;
}

interface NovelActions {
  setNovel: (novel: NovelInfo) => void;
  setLoading: (loading: boolean) => void;
}

export const NovelStateContext = createContext<
  (NovelState & NovelActions) | (NovelStateLoading & NovelActions) | null
>(null);

export function NovelStateContextProvider({
  children,
  novelParams,
}: {
  children: React.JSX.Element;
  novelParams: Route['params'];
}) {
  const routeNovel: RouteNovel = useMemo(
    () => ({
      inLibrary: false,
      isLocal: false,
      totalPages: 0,
      ...novelParams,
      id: 'NO_ID',
    }),
    [novelParams],
  );

  const [novel, setNovel] = useState<NovelInfo | RouteNovel>(routeNovel);
  const [loading, setLoading] = useState(true);

  const contextValue = useMemo(
    () =>
      ({
        novel,
        loading,
        path: novelParams.path,
        pluginId: novelParams.pluginId,
        setNovel,
        setLoading,
      } as (NovelState & NovelActions) | (NovelStateLoading & NovelActions)),
    [loading, novel, novelParams.path, novelParams.pluginId],
  );

  return (
    <NovelStateContext.Provider value={contextValue}>
      {children}
    </NovelStateContext.Provider>
  );
}
