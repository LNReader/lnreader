import ZipArchive from '@native/ZipArchive';
import dayjs from 'dayjs';
import {
  updateNovelCategoryById,
  updateNovelInfo,
} from '@database/queries/NovelQueries';
import { LOCAL_PLUGIN_ID } from '@plugins/pluginManager';
import { getString } from '@strings/translations';
import FileManager from '@native/FileManager';
import EpubUtil from '@native/EpubUtil';
import { NOVEL_STORAGE } from '@utils/Storages';
import { db } from '@database/db';
import { BackgroundTaskMetadata } from '@services/ServiceManager';

const insertLocalNovel = (
  name: string,
  path: string,
  cover?: string,
  author?: string,
  artist?: string,
  summary?: string,
): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `
          INSERT INTO 
            Novel(name, path, pluginId, inLibrary, isLocal) 
          VALUES(?, ?, 'local', 1, 1)`,
        [name, path],
        async (txObj, { insertId }) => {
          if (insertId && insertId >= 0) {
            await updateNovelCategoryById(insertId, [2]);
            const novelDir = NOVEL_STORAGE + '/local/' + insertId;
            await FileManager.mkdir(novelDir);
            const newCoverPath =
              'file://' + novelDir + '/' + cover?.split(/[\/\\]/).pop();
            if (cover && (await FileManager.exists(cover))) {
              await FileManager.moveFile(cover, newCoverPath);
            }
            await updateNovelInfo({
              id: insertId,
              pluginId: LOCAL_PLUGIN_ID,
              author: author,
              artist: artist,
              summary: summary,
              path: NOVEL_STORAGE + '/local/' + insertId,
              cover: newCoverPath,
              name: name,
              inLibrary: true,
              isLocal: true,
              totalPages: 0,
            });
            resolve(insertId);
          } else {
            reject(
              new Error(getString('advancedSettingsScreen.novelInsertFailed')),
            );
          }
        },
        (txObj, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

const insertLocalChapter = (
  novelId: number,
  fakeId: number,
  name: string,
  path: string,
  releaseTime: string,
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Chapter(novelId, name, path, releaseTime, position) VALUES(?, ?, ?, ?, ?)',
        [
          novelId,
          name,
          NOVEL_STORAGE + '/local/' + novelId + '/' + fakeId,
          releaseTime,
          fakeId,
        ],
        async (txObj, { insertId }) => {
          if (insertId && insertId >= 0) {
            let chapterText: string = '';
            try {
              path = decodeURI(path);
            } catch (error) {
              console.warn('Path decoding error:', error);
            }
            chapterText = FileManager.readFile(path);
            if (!chapterText) {
              reject(new Error('Failed to read chapter content.'));
              return;
            }
            const staticPaths: string[] = [];
            const novelDir = NOVEL_STORAGE + '/local/' + novelId;
            const epubContentDir = path.replace(/[^\\\/]+$/, '');
            chapterText = chapterText.replace(
              /(href|src)=(["'])(.*?)\2/g,
              ($0, $1, $2, $3: string) => {
                if ($3) {
                  staticPaths.push(`${epubContentDir}/${$3}`);
                }
                const sanitizedPath = $3.replace(/^[\\/]+/, '').replace(/[\\/]+$/, '');
                return `${$1}="file://${novelDir}/${sanitizedPath.split(/[\\\/]/).pop()}"`;
              },
            );
            await FileManager.mkdir(`${novelDir}/${insertId}`);
            await FileManager.writeFile(
              `${novelDir}/${insertId}/index.html`,
              chapterText,
            );
            resolve(staticPaths);
          } else {
            reject(
              new Error(
                getString('advancedSettingsScreen.chapterInsertFailed'),
              ),
            );
          }
        },
        (txObj, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const importEpub = async (
  {
    uri,
    filename,
  }: {
    uri: string;
    filename: string;
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

  const epubFilePath = FileManager.ExternalCachesDirectoryPath + '/novel.epub';
  await FileManager.copyFile(uri, epubFilePath);
  const epubDirPath = FileManager.ExternalCachesDirectoryPath + '/epub';
  if (await FileManager.exists(epubDirPath)) {
    await FileManager.unlink(epubDirPath);
  }
  await FileManager.mkdir(epubDirPath);
  await ZipArchive.unzip(epubFilePath, epubDirPath);
  const novel = await EpubUtil.parseNovelAndChapters(epubDirPath);
  if (!novel.name) {
    novel.name = filename.replace('.epub', '') || 'Untitled';
  }
  const novelId = await insertLocalNovel(
    novel.name,
    `${epubDirPath}/${novel.name}`, // temporary
    novel.cover,
    novel.author,
    novel.artist,
    novel.summary,
  );
  const now = dayjs().toISOString();
  const filePathSet = new Set<string>();
  if (novel.chapters) {
    for (let i = 0; i < novel.chapters?.length; i++) {
      const chapter = novel.chapters[i];
      if (!chapter.name) {
        chapter.name = chapter.path.split(/[\\\/]/).pop() || 'unknown';
      }

      setMeta(meta => ({
        ...meta,
        progressText: chapter.name,
      }));

      const filePaths = await insertLocalChapter(
        novelId,
        i,
        chapter.name,
        chapter.path,
        now,
      );
      filePaths.forEach(filePath => filePathSet.add(filePath));

      setMeta(meta => ({
        ...meta,
        progress: i / novel.chapters.length,
      }));
    }
  }
  const novelDir = NOVEL_STORAGE + '/local/' + novelId;

  setMeta(meta => ({
    ...meta,
    progressText: getString('advancedSettingsScreen.importStaticFiles'),
  }));

  for (let filePath of filePathSet) {
    if (await FileManager.exists(filePath)) {
      await FileManager.moveFile(
        filePath,
        `${novelDir}/${filePath.split(/[\\\/]/).pop()}`,
      );
    }
  }

  setMeta(meta => ({
    ...meta,
    progress: 1,
    isRunning: false,
  }));
};

