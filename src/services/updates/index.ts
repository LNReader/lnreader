import {
  getLibraryWithCategory,
  getLibraryNovelsFromDb,
} from '../../database/queries/LibraryQueries';

import { showToast } from '../../utils/showToast';
import {
  UpdateNovelOptions,
  updateNovel,
  updateNovelPage,
} from './LibraryUpdateQueries';
import { LibraryNovelInfo } from '@database/types';
import { sleep } from '@utils/sleep';
import { MMKVStorage, getMMKVObject } from '@utils/mmkv/mmkv';
import { LAST_UPDATE_TIME } from '@hooks/persisted/useUpdates';
import dayjs from 'dayjs';
import { SETTINGS } from '@hooks/persisted/useSettings';
import ServiceManager, {
  BackgroundTaskMetadata,
} from '@services/ServiceManager';
import { DefaultSettings } from '@screens/settings/constants/defaultValues';

const updateLibrary = async (
  {
    categoryId,
  }: {
    categoryId?: number;
  },
  setMeta: (
    transformer: (meta: BackgroundTaskMetadata) => BackgroundTaskMetadata,
  ) => void,
) => {
  setMeta(meta => ({
    ...meta,
    isRunning: true,
    progress: 0,
  }));

  const { downloadNewChapters, refreshNovelMetadata, onlyUpdateOngoingNovels } =
    getMMKVObject<DefaultSettings>(SETTINGS) || {};
  const options: UpdateNovelOptions = {
    downloadNewChapters: downloadNewChapters || false,
    refreshNovelMetadata: refreshNovelMetadata || false,
  };

  let libraryNovels: LibraryNovelInfo[] = [];
  if (categoryId) {
    libraryNovels = getLibraryWithCategory({
      filter:
        `categoryId = ${categoryId}` +
        (onlyUpdateOngoingNovels ? " AND status = 'Ongoing'" : ''),
    });
  } else {
    libraryNovels = getLibraryNovelsFromDb({
      filter: onlyUpdateOngoingNovels ? "status = 'Ongoing'" : '',
    }) as LibraryNovelInfo[];
  }

  if (libraryNovels.length > 0) {
    MMKVStorage.set(LAST_UPDATE_TIME, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    for (let i = 0; i < libraryNovels.length; i++) {
      setMeta(meta => ({
        ...meta,
        progressText: libraryNovels[i].name,
        progress: i / libraryNovels.length,
      }));

      try {
        const addDownloadTask = (chapterId: number, chapterName: string) => {
          ServiceManager.manager.addTask({
            name: 'DOWNLOAD_CHAPTER',
            data: {
              chapterId,
              novelName: libraryNovels[i].name,
              chapterName,
            },
          });
        };

        await updateNovel(
          libraryNovels[i].pluginId,
          libraryNovels[i].path,
          libraryNovels[i].id,
          options,
          addDownloadTask,
        );
        await sleep(1000);
      } catch (error: any) {
        showToast(libraryNovels[i].name + ': ' + error.message);
        continue;
      }
    }
  } else {
    showToast("There's no novel to be updated");
  }

  setMeta(meta => ({
    ...meta,
    progress: 1,
    isRunning: false,
  }));
};

// Wrapper functions for UI components that need to update novels
export const updateNovelWithDownloads = async (
  pluginId: string,
  novelPath: string,
  novelId: number,
  options: UpdateNovelOptions,
  novelName: string,
) => {
  const addDownloadTask = (chapterId: number, chapterName: string) => {
    ServiceManager.manager.addTask({
      name: 'DOWNLOAD_CHAPTER',
      data: {
        chapterId,
        novelName,
        chapterName,
      },
    });
  };

  return updateNovel(pluginId, novelPath, novelId, options, addDownloadTask);
};

export const updateNovelPageWithDownloads = async (
  pluginId: string,
  novelPath: string,
  novelId: number,
  page: string,
  options: Pick<UpdateNovelOptions, 'downloadNewChapters'>,
  novelName: string,
) => {
  const addDownloadTask = (chapterId: number, chapterName: string) => {
    ServiceManager.manager.addTask({
      name: 'DOWNLOAD_CHAPTER',
      data: {
        chapterId,
        novelName,
        chapterName,
      },
    });
  };

  return updateNovelPage(
    pluginId,
    novelPath,
    novelId,
    page,
    options,
    addDownloadTask,
  );
};

export { updateLibrary };
