import { useLibraryContext } from '@components/Context/LibraryContext';
import {
  getNovelByPath,
  insertNovelAndChapters,
  pickCustomNovelCover,
} from '@database/queries/NovelQueries';
import { downloadFile } from '@plugins/helpers/fetch';
import FileManager from '@specs/NativeFile';
import {
  NovelStateContext,
  RouteNovel,
} from '@screens/novel/context/NovelStateContext';
import { fetchNovel } from '@services/plugin/fetch';
import { getString } from '@strings/translations';
import { showToast } from '@utils/showToast';
import { StorageAccessFramework } from 'expo-file-system';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import useNovelPages from './useNovelPages';
import { NovelInfo } from '@database/types';

type NovelState = {
  path: string;
  pluginId: string;
  setNovel: (novel: NovelInfo) => void;
  followNovel: () => void;
  setCustomNovelCover: () => Promise<void>;
  saveNovelCover: () => Promise<void>;
  getNovel: () => void;
} & (
  | { novel: NovelInfo; loading: false }
  | { novel: RouteNovel; loading: true }
);

const useNovelState = (): NovelState => {
  const novelState = useContext(NovelStateContext);
  if (!novelState) {
    throw new Error(
      'useNovelState must be used within NovelStateContextProvider',
    );
  }

  const { novel, setNovel, path, pluginId, loading, setLoading } = novelState;
  const { calculatePages } = useNovelPages();
  const { switchNovelToLibrary } = useLibraryContext();

  const getNovel = useCallback(async () => {
    let tmpNovel = getNovelByPath(path, pluginId);
    if (!tmpNovel) {
      const sourceNovel = await fetchNovel(pluginId, path).catch(() => {
        throw new Error(getString('updatesScreen.unableToGetNovel'));
      });

      await insertNovelAndChapters(pluginId, sourceNovel);
      tmpNovel = getNovelByPath(path, pluginId);

      if (!tmpNovel) {
        return;
      }
    }
    calculatePages(tmpNovel, true);

    setNovel(tmpNovel);
  }, [calculatePages, path, pluginId, setNovel]);

  const followNovel = useCallback(() => {
    switchNovelToLibrary(path, pluginId).then(() => {
      if (!loading) {
        setNovel({
          ...novel,
          inLibrary: !novel?.inLibrary,
        });
      }
    });
  }, [loading, novel, path, pluginId, setNovel, switchNovelToLibrary]);

  const setCustomNovelCover = useCallback(async () => {
    if (loading) {
      return;
    }
    const newCover = await pickCustomNovelCover(novel);
    if (newCover) {
      setNovel({
        ...novel,
        cover: newCover,
      });
    }
  }, [loading, novel, setNovel]);

  const saveNovelCover = useCallback(async () => {
    if (!novel) {
      showToast(getString('novelScreen.coverNotSaved'));
      return;
    }
    if (!novel.cover) {
      showToast(getString('novelScreen.noCoverFound'));
      return;
    }
    const permissions =
      await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
      showToast(getString('novelScreen.coverNotSaved'));
      return;
    }
    const cover = novel.cover;
    let tempCoverUri: string | null = null;
    try {
      let imageExtension = cover.split('.').pop() || 'png';
      if (imageExtension.includes('?')) {
        imageExtension = imageExtension.split('?')[0] || 'png';
      }
      imageExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(
        imageExtension || '',
      )
        ? imageExtension
        : 'png';

      const novelName = novel.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${novelName}_${novel.id}.${imageExtension}`;
      const coverDestUri = await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        'image/' + imageExtension,
      );
      if (cover.startsWith('http')) {
        const { ExternalCachesDirectoryPath } = FileManager.getConstants();
        tempCoverUri = ExternalCachesDirectoryPath + '/' + fileName;
        await downloadFile(cover, tempCoverUri);
        FileManager.copyFile(tempCoverUri, coverDestUri);
      } else {
        FileManager.copyFile(cover, coverDestUri);
      }
      showToast(getString('novelScreen.coverSaved'));
    } catch (err: any) {
      showToast(err.message);
    } finally {
      if (tempCoverUri) {
        FileManager.unlink(tempCoverUri);
      }
    }
  }, [novel]);

  useEffect(() => {
    if (novel) {
      setLoading(false);
    } else {
      getNovel().finally(() => {
        setLoading(false);
      });
    }
  }, [getNovel, novel, setLoading]);

  const result = useMemo(
    () => ({
      novel,
      loading,
      path,
      pluginId,
      getNovel,
      setNovel,
      followNovel,
      setCustomNovelCover,
      saveNovelCover,
    }),
    [
      novel,
      loading,
      path,
      pluginId,
      getNovel,
      setNovel,
      followNovel,
      setCustomNovelCover,
      saveNovelCover,
    ],
  );

  return result as NovelState;
};

export default useNovelState;
