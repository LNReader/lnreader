import { SELF_HOST_BACKUP } from '@hooks/persisted/useSelfHost';
import { TRACKER } from '@hooks/persisted/useTracker';
import { LAST_UPDATE_TIME } from '@hooks/persisted/useUpdates';
import { BACKGROUND_ACTION } from '@services/constants';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { version } from '../../../package.json';
import {
  _restoreNovelAndChapters,
  getAllNovels,
} from '@database/queries/NovelQueries';
import { getNovelChapters } from '@database/queries/ChapterQueries';
import {
  _restoreCategory,
  getAllNovelCategories,
  getCategoriesFromDb,
} from '@database/queries/CategoryQueries';
import { BackupCategory } from '@database/types';
import { BackupEntryName } from './types';
import FileManager from '@native/FileManager';
import { getAppStorages } from '@utils/Storages';

const _getAppStorageUriPrefix = () => {
  const { ROOT_STORAGE } = getAppStorages();
  return 'file://' + ROOT_STORAGE;
};
export const CACHE_DIR_PATH =
  FileManager.ExternalCachesDirectoryPath + '/BackupData';

const backupMMKVData = () => {
  const excludeKeys = [
    BACKGROUND_ACTION,
    TRACKER,
    SELF_HOST_BACKUP,
    LAST_UPDATE_TIME,
  ];
  const keys = MMKVStorage.getAllKeys().filter(
    key => !excludeKeys.includes(key),
  );
  const data = {} as any;
  for (let key of keys) {
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
  for (let key in data) {
    MMKVStorage.set(key, data[key]);
  }
};

export const prepareBackupData = async (cacheDirPath: string) => {
  const novelDirPath = cacheDirPath + '/' + BackupEntryName.NOVEL_AND_CHAPTERS;
  if (await FileManager.exists(novelDirPath)) {
    await FileManager.unlink(novelDirPath);
  }

  await FileManager.mkdir(novelDirPath); // this also creates cacheDirPath

  // version
  await FileManager.writeFile(
    cacheDirPath + '/' + BackupEntryName.VERSION,
    JSON.stringify({ version: version }),
  );

  // novels
  await getAllNovels().then(async novels => {
    for (const novel of novels) {
      const chapters = await getNovelChapters(novel.id);
      await FileManager.writeFile(
        novelDirPath + '/' + novel.id + '.json',
        JSON.stringify({
          chapters: chapters,
          ...novel,
          cover: novel.cover?.replace(_getAppStorageUriPrefix(), ''),
        }),
      );
    }
  });

  // categories
  await getCategoriesFromDb().then(categories => {
    return getAllNovelCategories().then(async novelCategories => {
      await FileManager.writeFile(
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
    });
  });

  // settings
  await FileManager.writeFile(
    cacheDirPath + '/' + BackupEntryName.SETTING,
    JSON.stringify(backupMMKVData()),
  );
};

export const restoreData = async (cacheDirPath: string) => {
  const novelDirPath = cacheDirPath + '/' + BackupEntryName.NOVEL_AND_CHAPTERS;

  // version
  // nothing to do

  // novels
  await FileManager.readDir(novelDirPath).then(async items => {
    for (const item of items) {
      if (!item.isDirectory) {
        await FileManager.readFile(item.path).then(content => {
          const backupNovel = JSON.parse(content);
          if (!backupNovel.cover?.startsWith('http')) {
            backupNovel.cover = _getAppStorageUriPrefix() + backupNovel.cover;
          }
          return _restoreNovelAndChapters(backupNovel);
        });
      }
    }
  });

  // categories
  await FileManager.readFile(
    cacheDirPath + '/' + BackupEntryName.CATEGORY,
  ).then(async content => {
    const categories: BackupCategory[] = JSON.parse(content);
    for (const category of categories) {
      await _restoreCategory(category);
    }
  });

  // settings
  await FileManager.readFile(cacheDirPath + '/' + BackupEntryName.SETTING).then(
    content => {
      restoreMMKVData(JSON.parse(content));
    },
  );
};
