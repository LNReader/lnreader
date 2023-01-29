import { useMMKVObject } from 'react-native-mmkv';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { showToast } from './showToast';

export const SOURCE_STORAGE = 'SOURCE_STORAGE';

interface SourceStorage {
  cookies?: any;
}

export type SourceStorageMap = Record<number, Partial<SourceStorage>>;

const useSourceStorage = ({ sourceId = -1 }: { sourceId?: number }) => {
  const [values, setValues] = useMMKVObject<SourceStorageMap>(
    SOURCE_STORAGE,
    MMKVStorage,
  );

  const setSourceStorage = (key: keyof SourceStorage, value: any): void => {
    setValues({
      ...values,
      [sourceId]: {
        ...values?.[sourceId],
        [key]: value,
      },
    });
  };

  const clearCookies = (): void => {
    // let tempStorage = {};

    // if (values) {
    //   tempStorage = Object.fromEntries(
    //     Object.entries(values).map(([id, sourceData]) => {
    //       delete sourceData.cookies;

    //       return [id, sourceData];
    //     }),
    //   );
    // }

    setValues({});
    showToast('Cookies cleared');
  };

  const sourceStorage = values?.[sourceId];

  return {
    ...sourceStorage,
    setSourceStorage,
    clearCookies,
  };
};

export default useSourceStorage;

export const getSourceStorage = (sourceId: number) => {
  const rawSettings = MMKVStorage.getString(SOURCE_STORAGE) || '{}';
  const parsedSettings: Partial<SourceStorageMap> = JSON.parse(rawSettings);

  return parsedSettings[sourceId] || {};
};
