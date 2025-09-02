import { ChapterInfo } from '@database/types';
import { ReaderStackParamList } from '@navigators/types';
import { RouteProp } from '@react-navigation/native';
import { LAST_READ_PREFIX } from '@utils/constants/mmkv';
import { createContext, useMemo } from 'react';
import { useMMKVObject } from 'react-native-mmkv';

type Route =
  | RouteProp<ReaderStackParamList, 'Novel'>['params']
  | RouteProp<ReaderStackParamList, 'Chapter'>['params']['novel'];
type Path = Route['path'];
type PluginId = Route['pluginId'];

interface ReadingProgressState {
  lastRead: ChapterInfo | undefined;
}

interface ReadingProgressActions {
  setLastRead: (chapter: ChapterInfo | undefined) => void;
}

export const NovelLastReadContext = createContext<
  (ReadingProgressState & ReadingProgressActions) | null
>(null);

export function NovelLastReadContextProvider({
  children,
  path,
  pluginId,
}: {
  children: React.JSX.Element;
  path: Path;
  pluginId: PluginId;
}) {
  const [lastRead, setLastRead] = useMMKVObject<ChapterInfo>(
    `${LAST_READ_PREFIX}_${pluginId}_${path}`,
  );

  const contextValue = useMemo(
    () => ({
      lastRead,
      setLastRead,
    }),
    [lastRead, setLastRead],
  );

  return (
    <NovelLastReadContext.Provider value={contextValue}>
      {children}
    </NovelLastReadContext.Provider>
  );
}
