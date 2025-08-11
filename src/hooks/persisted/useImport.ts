import { useLibraryContext } from '@components/Context/LibraryContext';
import { useQueue } from '@providers/Providers';
import ServiceManager from '@services/ServiceManager';
import { DocumentPickerResult } from 'expo-document-picker';
import { useCallback, useEffect, useMemo } from 'react';

export default function useImport() {
  const { refetchLibrary } = useLibraryContext();
  const { importQueue } = useQueue();

  useEffect(() => {
    refetchLibrary();
  }, [importQueue.length, refetchLibrary]);

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
