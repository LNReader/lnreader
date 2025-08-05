import { useAppSettings } from '@hooks/persisted';
import { NovelSettings } from '@hooks/persisted/novel/useNovel';
import { ReaderStackParamList } from '@navigators/types';
import { RouteProp } from '@react-navigation/native';
import { NOVEL_SETTINSG_PREFIX } from '@utils/constants/mmkv';
import { createContext, useMemo } from 'react';
import { useMMKVObject } from 'react-native-mmkv';

type Route =
  | RouteProp<ReaderStackParamList, 'Novel'>['params']
  | RouteProp<ReaderStackParamList, 'Chapter'>['params']['novel'];
type Path = Route['path'];
type PluginId = Route['pluginId'];

interface SettingsState {
  novelSettings: NovelSettings;
}

interface SettingsActions {
  setNovelSettings: (settings: NovelSettings) => void;
}

export const NovelSettingsContext = createContext<
  (SettingsState & SettingsActions) | null
>(null);

const defaultNovelSettings: NovelSettings = {
  showChapterTitles: true,
};

export function NovelSettingsContextProvider({
  children,
  path,
  pluginId,
}: {
  children: React.JSX.Element;
  path: Path;
  pluginId: PluginId;
}) {
  const { defaultChapterSort } = useAppSettings();

  const [mmkvNovelSettings = defaultNovelSettings, setNovelSettings] =
    useMMKVObject<NovelSettings>(
      `${NOVEL_SETTINSG_PREFIX}_${pluginId}_${path}`,
    );

  const novelSettings = useMemo(() => {
    if (!mmkvNovelSettings.sort) {
      mmkvNovelSettings.sort = defaultChapterSort;
    }
    return mmkvNovelSettings;
  }, [defaultChapterSort, mmkvNovelSettings]);

  const contextValue = useMemo(
    () => ({
      novelSettings,
      setNovelSettings,
    }),
    [novelSettings, setNovelSettings],
  );

  return (
    <NovelSettingsContext.Provider value={contextValue}>
      {children}
    </NovelSettingsContext.Provider>
  );
}
