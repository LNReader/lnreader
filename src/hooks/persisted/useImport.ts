import { useLibraryContext } from '@components/Context/LibraryContext';
import ServiceManager, { BackgroundTask } from '@services/ServiceManager';
import { DocumentPickerResult } from 'expo-document-picker';
import { useCallback, useEffect, useMemo } from 'react';
import { useMMKVObject } from 'react-native-mmkv';

export default function useImport() {
  const { refetchLibrary } = useLibraryContext();
  const [queue] = useMMKVObject<BackgroundTask[]>(
    ServiceManager.manager.STORE_KEY,
  );
  const importQueue = useMemo(
    () => queue?.filter(t => t.name === 'IMPORT_EPUB') || [],
    [queue],
  );

  useEffect(() => {
    refetchLibrary();
  }, [importQueue, refetchLibrary]);

  const importNovel = useCallback((pickedNovel: DocumentPickerResult) => {
    if (pickedNovel.canceled) return;
    ServiceManager.manager.addTask(
      pickedNovel.assets.map(asset => ({
        name: 'IMPORT_EPUB',
        data: {
          filename: asset.name,
          uri: asset.uri,
        },
      })),
    );
  }, []);

  const hookContent = useMemo(
    () => ({
      importQueue,
      importNovel,
      resumeImport: () => ServiceManager.manager.resume(),
      pauseImport: () => ServiceManager.manager.pause(),
      cancelImport: () =>
        ServiceManager.manager.removeTasksByName('IMPORT_EPUB'),
    }),
    [importNovel, importQueue],
  );

  return hookContent;
}
