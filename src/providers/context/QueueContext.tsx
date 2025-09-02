import React, { createContext, useContext, useMemo } from 'react';
import { useMMKVObject } from 'react-native-mmkv';

import ServiceManager, { QueuedBackgroundTask } from '@services/ServiceManager';

type QueueContextType = {
  taskQueue: QueuedBackgroundTask[];
  importQueue: QueuedBackgroundTask<'IMPORT_EPUB'>[];
  downloadQueue: QueuedBackgroundTask<'DOWNLOAD_CHAPTER'>[];
};

const QueueContext = createContext<QueueContextType | null>(null);

export function QueueContextProvider({
  children,
}: {
  children: React.JSX.Element;
}) {
  const [taskQueue = []] = useMMKVObject<QueuedBackgroundTask[]>(
    ServiceManager.manager.STORE_KEY,
  );

  const contextValue = useMemo(() => {
    const importQueue: QueuedBackgroundTask<'IMPORT_EPUB'>[] = [];
    const downloadQueue: QueuedBackgroundTask<'DOWNLOAD_CHAPTER'>[] = [];

    taskQueue.forEach(task => {
      switch (task.task.name) {
        case 'IMPORT_EPUB':
          importQueue.push(task as QueuedBackgroundTask<'IMPORT_EPUB'>);
          break;
        case 'DOWNLOAD_CHAPTER':
          downloadQueue.push(task as QueuedBackgroundTask<'DOWNLOAD_CHAPTER'>);
          break;
      }
    });

    return {
      taskQueue,
      importQueue,
      downloadQueue,
    };
  }, [taskQueue]);

  return (
    <QueueContext.Provider value={contextValue}>
      {children}
    </QueueContext.Provider>
  );
}

export const useQueue = () => {
  return useContext(QueueContext)!;
};
