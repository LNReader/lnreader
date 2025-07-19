import { SELF_HOST_BACKUP } from '@hooks/persisted/useSelfHost';
import { TRACKER } from '@hooks/persisted/useTracker';
import { LAST_UPDATE_TIME } from '@hooks/persisted/useUpdates';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { version } from '../../../package.json';
import {
  _restoreNovelAndChapters,
  getAllNovels,
} from '@database/queries/NovelQueries';
import { getNovelChapters } from '@database/queries/ChapterQueries';
import {
  getAllNovelCategories,
  getCategoriesFromDb,
} from '@database/queries/CategoryQueries';
import {
  restoreNovelAndChaptersTransaction as restoreNovelAndChaptersQuery,
  mergeNovelAndChaptersTransaction as mergeNovelAndChaptersQuery,
  restoreCategoryTransaction as restoreCategoryQuery,
  ensureNovelsHaveDefaultCategory as ensureDefaultCategoryQuery,
} from '@database/queries/BackupQueries';
import { BackupEntryName } from './types';
import ServiceManager, {
  BackgroundTaskMetadata,
} from '@services/ServiceManager';
import { ROOT_STORAGE } from '@utils/Storages';
import { BackupNovel } from '@database/types';
import { showToast } from '@utils/showToast';
import NativeFile from '@specs/NativeFile';

const APP_STORAGE_URI = 'file://' + ROOT_STORAGE;

export const CACHE_DIR_PATH =
  NativeFile.getConstants().ExternalCachesDirectoryPath + '/BackupData';

export const copyDirectoryRecursive = async (
  sourcePath: string,
  destPath: string,
) => {
  if (!(await NativeFile.exists(sourcePath))) {
    return;
  }

  if (!(await NativeFile.exists(destPath))) {
    await NativeFile.mkdir(destPath);
  }

  const items = await NativeFile.readDir(sourcePath);

  for (const item of items) {
    const sourceItemPath = sourcePath + '/' + item.name;
    const destItemPath = destPath + '/' + item.name;

    if (item.isDirectory) {
      await copyDirectoryRecursive(sourceItemPath, destItemPath);
    } else {
      await NativeFile.copyFile(sourceItemPath, destItemPath);
    }
  }
};

const backupMMKVData = () => {
  const excludeKeys = [
    ServiceManager.manager.STORE_KEY,
    TRACKER,
    SELF_HOST_BACKUP,
    LAST_UPDATE_TIME,
  ];
  const keys = MMKVStorage.getAllKeys().filter(
    key => !excludeKeys.includes(key),
  );
  const data = {} as any;
  for (const key of keys) {
    let value: number | string | boolean | undefined =
      MMKVStorage.getString(key);
    if (!value) {
      value = MMKVStorage.getBoolean(key);
    }
    if (key && value) {
      data[key] = value;
    }
  }
  return data;
};

const restoreMMKVData = (data: any) => {
  for (const key in data) {
    MMKVStorage.set(key, data[key]);
  }
};

export const prepareBackupData = async (
  cacheDirPath: string,
  includeDownloadedChapters: boolean = true,
) => {
  const novelDirPath = cacheDirPath + '/' + BackupEntryName.NOVEL_AND_CHAPTERS;

  if (!(await NativeFile.exists(cacheDirPath))) {
    await NativeFile.mkdir(cacheDirPath);
  }

  if (await NativeFile.exists(novelDirPath)) {
    await NativeFile.unlink(novelDirPath);
  }

  await NativeFile.mkdir(novelDirPath);
  // version
  await NativeFile.writeFile(
    cacheDirPath + '/' + BackupEntryName.VERSION,
    JSON.stringify({ version: version }),
  );

  // novels
  const libraryNovels = (await getAllNovels()).filter(
    novel => novel.inLibrary === 1,
  );

  for (const novel of libraryNovels) {
    let chapters = await getNovelChapters(novel.id);

    if (!includeDownloadedChapters) {
      chapters = chapters.filter(chapter => !chapter.isDownloaded);
    }

    await NativeFile.writeFile(
      novelDirPath + '/' + novel.id + '.json',
      JSON.stringify({
        chapters: chapters,
        ...novel,
        cover: novel.cover?.replace(APP_STORAGE_URI, ''),
      }),
    );
  }

  // categories
  const categories = getCategoriesFromDb();
  const novelCategories = getAllNovelCategories();
  await NativeFile.writeFile(
    cacheDirPath + '/' + BackupEntryName.CATEGORY,
    JSON.stringify(
      categories.map(category => {
        return {
          ...category,
          novelIds: novelCategories
            .filter(nc => nc.categoryId === category.id)
            .map(nc => nc.novelId),
        };
      }),
    ),
  );

  // settings
  await NativeFile.writeFile(
    cacheDirPath + '/' + BackupEntryName.SETTING,
    JSON.stringify(backupMMKVData()),
  );
};

export const restoreData = async (cacheDirPath: string) => {
  const novelDirPath = cacheDirPath + '/' + BackupEntryName.NOVEL_AND_CHAPTERS;

  // version
  // nothing to do

  // novels
  const items = NativeFile.readDir(novelDirPath);
  for (const item of items) {
    if (!item.isDirectory) {
      const backupNovel = JSON.parse(NativeFile.readFile(item.path));
      if (!backupNovel.cover?.startsWith('http')) {
        backupNovel.cover = APP_STORAGE_URI + backupNovel.cover;
      }
      await _restoreNovelAndChapters(backupNovel);
    }
  }

  restoreMMKVData(
    JSON.parse(
      NativeFile.readFile(cacheDirPath + '/' + BackupEntryName.SETTING),
    ),
  );
};

const restoreCategories = async (
  backupDir: string,
  setMeta?: (
    transformer: (meta: BackgroundTaskMetadata) => BackgroundTaskMetadata,
  ) => void,
) => {
  const categoriesPath = backupDir + '/' + BackupEntryName.CATEGORY;

  if (!(await NativeFile.exists(categoriesPath))) {
    return;
  }

  try {
    const categoriesData = JSON.parse(
      await NativeFile.readFile(categoriesPath),
    );

    if (!Array.isArray(categoriesData) || categoriesData.length === 0) {
      return;
    }

    const novelsPath = backupDir + '/' + BackupEntryName.NOVEL_AND_CHAPTERS;
    const oldIdToPathMap = new Map<
      number,
      { pluginId: string; path: string }
    >();

    if (await NativeFile.exists(novelsPath)) {
      const novelFiles = await NativeFile.readDir(novelsPath);

      for (const novelFile of novelFiles) {
        if (!novelFile.isDirectory && novelFile.name.endsWith('.json')) {
          try {
            const backupNovelData = JSON.parse(
              await NativeFile.readFile(novelFile.path),
            ) as BackupNovel;
            if (
              backupNovelData.id &&
              backupNovelData.pluginId &&
              backupNovelData.path
            ) {
              oldIdToPathMap.set(backupNovelData.id, {
                pluginId: backupNovelData.pluginId,
                path: backupNovelData.path,
              });
            }
          } catch (error) {
            continue;
          }
        }
      }
    }

    const currentNovels = await getAllNovels();
    const pathToCurrentIdMap = new Map<string, number>();
    for (const novel of currentNovels) {
      const key = `${novel.pluginId}:${novel.path}`;
      pathToCurrentIdMap.set(key, novel.id);
    }

    let restoredCount = 0;
    const totalCategories = categoriesData.length;

    for (const categoryData of categoriesData) {
      try {
        const currentNovelIds: number[] = [];

        if (categoryData.novelIds && Array.isArray(categoryData.novelIds)) {
          for (const oldNovelId of categoryData.novelIds) {
            const pathInfo = oldIdToPathMap.get(oldNovelId);
            if (pathInfo) {
              const key = `${pathInfo.pluginId}:${pathInfo.path}`;
              const currentId = pathToCurrentIdMap.get(key);
              if (currentId) {
                currentNovelIds.push(currentId);
              }
            }
          }
        }

        const updatedCategoryData = {
          ...categoryData,
          novelIds: currentNovelIds,
        };

        await restoreCategoryQuery(updatedCategoryData);

        restoredCount++;
        if (setMeta) {
          setMeta(meta => ({
            ...meta,
            progress: restoredCount / totalCategories,
            progressText: `Restoring categories: ${restoredCount}/${totalCategories}`,
          }));
        }
      } catch (error: any) {
        showToast(
          `Failed to restore category ${categoryData.name || 'Unknown'}: ${
            error.message
          }`,
        );
      }
    }

    await ensureDefaultCategoryQuery();
  } catch (error: any) {
    showToast(`Failed to read categories file: ${error.message}`);
  }
};

const restoreNovelsAdvanced = async (
  backupDir: string,
  result?: any,
  setMeta?: (
    transformer: (meta: BackgroundTaskMetadata) => BackgroundTaskMetadata,
  ) => void,
) => {
  const novelsPath = backupDir + '/' + BackupEntryName.NOVEL_AND_CHAPTERS;

  if (!(await NativeFile.exists(novelsPath))) {
    return;
  }

  const novelFiles = await NativeFile.readDir(novelsPath);
  const totalNovels = novelFiles.length;
  let processedCount = 0;

  const currentNovels = await getAllNovels();

  const currentNovelMap = new Map(
    currentNovels.map(novel => [`${novel.pluginId}:${novel.path}`, novel]),
  );

  for (const novelFile of novelFiles) {
    if (!novelFile.isDirectory && novelFile.name.endsWith('.json')) {
      try {
        const backupNovelData = JSON.parse(
          await NativeFile.readFile(novelFile.path),
        ) as BackupNovel;

        if (!backupNovelData.pluginId || !backupNovelData.path) {
          if (result) {
            result.errored?.push({
              name: backupNovelData.name || novelFile.name,
              reason: 'Invalid backup data - missing pluginId or path',
            });
          }
          continue;
        }

        const novelKey = `${backupNovelData.pluginId}:${backupNovelData.path}`;
        const existingNovel = currentNovelMap.get(novelKey);

        if (!existingNovel) {
          await restoreNovelAndChaptersQuery(backupNovelData);
          if (result) {
            result.added?.push({
              name: backupNovelData.name,
              reason: 'New novel added from backup',
            });
          }
        } else {
          const currentChapters = await getNovelChapters(existingNovel.id);
          const backupChapterCount = backupNovelData.chapters?.length || 0;
          const currentChapterCount = currentChapters.length;
          let shouldUpdateNovel = false;
          let mergeReason = '';

          if (backupChapterCount > currentChapterCount) {
            shouldUpdateNovel = true;
            mergeReason = `Backup has more chapters (${backupChapterCount} vs ${currentChapterCount})`;
          } else if (
            backupChapterCount === currentChapterCount &&
            backupNovelData.chapters
          ) {
            const backupReadCount = backupNovelData.chapters.filter(
              ch => !ch.unread,
            ).length;
            const currentReadCount = currentChapters.filter(
              ch => !ch.unread,
            ).length;
            if (backupReadCount > currentReadCount) {
              shouldUpdateNovel = true;
              mergeReason = `Backup has more chapters read (${backupReadCount} vs ${currentReadCount})`;
            } else {
              mergeReason = 'Kept existing novel (equal or less progress)';
            }
          } else {
            mergeReason = 'Kept existing novel (more chapters locally)';
          }

          await mergeNovelAndChaptersQuery(
            backupNovelData,
            existingNovel.id,
            shouldUpdateNovel,
          );

          if (result) {
            if (shouldUpdateNovel) {
              result.overwritten?.push({
                name: backupNovelData.name,
                reason: mergeReason,
              });
            } else {
              result.skipped?.push({
                name: backupNovelData.name,
                reason: mergeReason,
              });
            }
          }
        }

        processedCount++;
        if (setMeta) {
          setMeta(meta => ({
            ...meta,
            progress: 0.3 + (processedCount / totalNovels) * 0.6,
            progressText: `Restoring novels: ${processedCount}/${totalNovels}`,
          }));
        }
      } catch (error: any) {
        if (result) {
          result.errored?.push({
            name: novelFile.name,
            reason: `Failed to restore novel: ${error.message}`,
          });
        }
      }
    }
  }
};

export const restoreDataMerge = async (
  backupDir: string,
  result?: any,
  setMeta?: (
    transformer: (meta: BackgroundTaskMetadata) => BackgroundTaskMetadata,
  ) => void,
) => {
  try {
    if (setMeta) {
      setMeta(meta => ({
        ...meta,
        progress: 0,
        progressText: 'Starting restore...',
      }));
    }

    await restoreNovelsAdvanced(backupDir, result, setMeta);

    await restoreCategories(backupDir, setMeta);

    if (setMeta) {
      setMeta(meta => ({
        ...meta,
        progress: 1,
        progressText: 'Restore complete',
      }));
    }
  } catch (error: any) {
    showToast(`Data restore failed: ${error.message}`);
    if (setMeta) {
      setMeta(meta => ({
        ...meta,
        isRunning: false,
        progressText: `Failed: ${error.message}`,
      }));
    }
  }
};
