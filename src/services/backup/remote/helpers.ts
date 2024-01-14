import { SELF_HOST_BACKUP } from '@hooks/persisted/useSelfHost';
import { TRACKER } from '@hooks/persisted/useTracker';
import { LAST_UPDATE_TIME } from '@hooks/persisted/useUpdates';
import { BACKGROUND_ACTION } from '@services/constants';
import { MMKVStorage } from '@utils/mmkv/mmkv';

export const backupMMKVData = () => {
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
    if (value) {
      data[key] = value;
    }
  }
  return data;
};

export const restoreMMKVData = (data: any) => {
  for (let key in data) {
    MMKVStorage.set(key, data[key]);
  }
};
