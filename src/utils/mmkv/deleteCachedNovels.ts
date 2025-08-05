import { MMKVStorage } from '@utils/mmkv/mmkv';
import {
  deleteCachedNovels as _deleteCachedNovels,
  getCachedNovels as _getCachedNovels,
} from '@database/queries/NovelQueries';
import { NOVEL_STORAGE } from '@utils/Storages';
import NativeFile from '@specs/NativeFile';
import {
  LAST_READ_PREFIX,
  NOVEL_PAGE_INDEX_PREFIX,
  NOVEL_SETTINSG_PREFIX,
  TRACKED_NOVEL_PREFIX,
} from '@utils/constants/mmkv';

export const deleteCachedNovels = async () => {
  const cachedNovels = await _getCachedNovels();
  for (const novel of cachedNovels) {
    MMKVStorage.delete(`${TRACKED_NOVEL_PREFIX}_${novel.id}`);
    MMKVStorage.delete(
      `${NOVEL_PAGE_INDEX_PREFIX}_${novel.pluginId}_${novel.path}`,
    );
    MMKVStorage.delete(
      `${NOVEL_SETTINSG_PREFIX}_${novel.pluginId}_${novel.path}`,
    );
    MMKVStorage.delete(`${LAST_READ_PREFIX}_${novel.pluginId}_${novel.path}`);
    const novelDir = NOVEL_STORAGE + '/' + novel.pluginId + '/' + novel.id;
    if (NativeFile.exists(novelDir)) {
      NativeFile.unlink(novelDir);
    }
  }
  _deleteCachedNovels();
};
