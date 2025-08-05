import {
  getNovelByPath,
  insertNovelAndChapters,
} from '@database/queries/NovelQueries';
import { NovelInfo } from '@database/types';
import { useNovelPages } from '@hooks/persisted';
import { ReaderStackParamList } from '@navigators/types';
import { RouteProp } from '@react-navigation/native';
import { fetchNovel } from '@services/plugin/fetch';
import { getString } from '@strings/translations';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

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
  getNovel: () => Promise<void>;
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
  const { calculatePages } = useNovelPages();
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
  const path = routeNovel.path;
  const pluginId = routeNovel.pluginId;

  const getNovel = useCallback(async () => {
    let tmpNovel = getNovelByPath(path, pluginId);
    if (!tmpNovel) {
      const sourceNovel = await fetchNovel(pluginId, path).catch(() => {
        throw new Error(getString('updatesScreen.unableToGetNovel'));
      });

      await insertNovelAndChapters(pluginId, sourceNovel);
      tmpNovel = getNovelByPath(path, pluginId);

      if (!tmpNovel) {
        return;
      }
    }
    calculatePages(tmpNovel, true);

    setNovel(tmpNovel);
  }, [calculatePages, path, pluginId, setNovel]);

  useEffect(() => {
    getNovel().finally(() => {
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo(
    () =>
      ({
        novel,
        loading,
        path: novelParams.path,
        pluginId: novelParams.pluginId,
        setNovel,
        setLoading,
        getNovel,
      } as (NovelState & NovelActions) | (NovelStateLoading & NovelActions)),
    [getNovel, loading, novel, novelParams.path, novelParams.pluginId],
  );

  return (
    <NovelStateContext.Provider value={contextValue}>
      {children}
    </NovelStateContext.Provider>
  );
}
