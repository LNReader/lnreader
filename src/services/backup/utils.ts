import RNFS from 'react-native-fs';
import { SELF_HOST_BACKUP } from '@hooks/persisted/useSelfHost';
import { TRACKER } from '@hooks/persisted/useTracker';
import { LAST_UPDATE_TIME } from '@hooks/persisted/useUpdates';
import { BACKGROUND_ACTION } from '@services/constants';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { appVersion } from '@utils/versionUtils';
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
import TextFile from '@native/TextFile';

export const CACHE_DIR_PATH = RNFS.ExternalCachesDirectoryPath + '/BackupData';

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
  if (await RNFS.exists(novelDirPath)) {
    await RNFS.unlink(novelDirPath);
  }

  await RNFS.mkdir(novelDirPath); // this also creates cacheDirPath

  // version
  await TextFile.writeFile(
    cacheDirPath + '/' + BackupEntryName.VERSION,
    JSON.stringify({ version: appVersion }),
  );

  // novels
  await getAllNovels().then(async novels => {
    for (const novel of novels) {
      const chapters = await getNovelChapters(novel.id);
      await TextFile.writeFile(
        novelDirPath + '/' + novel.id + '.json',
        JSON.stringify({
          chapters: chapters,
          ...novel,
        }),
      );
    }
  });

  // categories
  await getCategoriesFromDb().then(categories => {
    return getAllNovelCategories().then(async novelCategories => {
      await TextFile.writeFile(
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
  await TextFile.writeFile(
    cacheDirPath + '/' + BackupEntryName.SETTING,
    JSON.stringify(backupMMKVData()),
  );
};

export const restoreData = async (cacheDirPath: string) => {
  const novelDirPath = cacheDirPath + '/' + BackupEntryName.NOVEL_AND_CHAPTERS;

  // version
  // nothing to do

  // novels
  await RNFS.readDir(novelDirPath).then(async items => {
    for (const item of items) {
      if (item.isFile()) {
        await TextFile.readFile(item.path).then(content =>
          _restoreNovelAndChapters(JSON.parse(content)),
        );
      }
    }
  });

  // categories
  await TextFile.readFile(cacheDirPath + '/' + BackupEntryName.CATEGORY).then(
    async content => {
      const categories: BackupCategory[] = JSON.parse(content);
      for (const category of categories) {
        await _restoreCategory(category);
      }
    },
  );

  // settings
  await TextFile.readFile(cacheDirPath + '/' + BackupEntryName.SETTING).then(
    content => {
      restoreMMKVData(JSON.parse(content));
    },
  );
};
