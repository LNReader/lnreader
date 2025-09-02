import ServiceManager from '@services/ServiceManager';
import { DocumentPickerResult } from 'expo-document-picker';
import { useCallback, useMemo } from 'react';

export default function useImport() {
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
      importNovel,
      resumeImport: () => ServiceManager.manager.resume(),
      pauseImport: () => ServiceManager.manager.pause(),
      cancelImport: () =>
        ServiceManager.manager.removeTasksByName('IMPORT_EPUB'),
    }),
    [importNovel],
  );

  return hookContent;
}
