import dayjs from 'dayjs';
import {
  updateNovelCategoryById,
  updateNovelInfo,
} from '@database/queries/NovelQueries';
import { LOCAL_PLUGIN_ID } from '@plugins/pluginManager';
import { getString } from '@strings/translations';
import { NOVEL_STORAGE } from '@utils/Storages';
import { db } from '@database/db';
import { BackgroundTaskMetadata } from '@services/ServiceManager';
import NativeFile from '@specs/NativeFile';
import NativeZipArchive from '@specs/NativeZipArchive';
import NativeEpub from '@specs/NativeEpub';

const insertLocalNovel = async (
  name: string,
  path: string,
  cover?: string,
  author?: string,
  artist?: string,
  summary?: string,
) => {
  const insertedNovel = await db.runAsync(
    `
      INSERT INTO 
        Novel(name, path, pluginId, inLibrary, isLocal) 
        VALUES(?, ?, 'local', 1, 1)`,
    name,
    path,
  );
  if (insertedNovel.lastInsertRowId && insertedNovel.lastInsertRowId >= 0) {
    await updateNovelCategoryById(insertedNovel.lastInsertRowId, [2]);
    const novelDir = NOVEL_STORAGE + '/local/' + insertedNovel.lastInsertRowId;
    NativeFile.mkdir(novelDir);
    const newCoverPath =
      'file://' + novelDir + '/' + cover?.split(/[/\\]/).pop();
    if (cover && NativeFile.exists(cover)) {
      NativeFile.moveFile(cover, newCoverPath);
    }
    await updateNovelInfo({
      id: insertedNovel.lastInsertRowId,
      pluginId: LOCAL_PLUGIN_ID,
      author: author,
      artist: artist,
      summary: summary,
      path: NOVEL_STORAGE + '/local/' + insertedNovel.lastInsertRowId,
      cover: newCoverPath,
      name: name,
      inLibrary: true,
      isLocal: true,
      totalPages: 0,
    });
    return insertedNovel.lastInsertRowId;
  }
  throw new Error(getString('advancedSettingsScreen.novelInsertFailed'));
};

const insertLocalChapter = async (
  novelId: number,
  fakeId: number,
  name: string,
  path: string,
  releaseTime: string,
) => {
  const insertedChapter = await db.runAsync(
    'INSERT INTO Chapter(novelId, name, path, releaseTime, position) VALUES(?, ?, ?, ?, ?)',
    novelId,
    name,
    NOVEL_STORAGE + '/local/' + novelId + '/' + fakeId,
    releaseTime,
    fakeId,
  );
  if (insertedChapter.lastInsertRowId && insertedChapter.lastInsertRowId >= 0) {
    let chapterText: string = '';
    try {
      path = decodeURI(path);
    } catch {
      // nothing to do
    }
    chapterText = NativeFile.readFile(path);
    if (!chapterText) {
      return [];
    }
    const novelDir = NOVEL_STORAGE + '/local/' + novelId;
    chapterText = chapterText.replace(
      /(href|src)=(["'])(.*?)\2/g,
      (_, $1, __, $3: string) => {
        return `${$1}="file://${novelDir}/${$3.split(/[\\/]/).pop()}"`;
      },
    );
    NativeFile.mkdir(novelDir + '/' + insertedChapter.lastInsertRowId);
    NativeFile.writeFile(
      novelDir + '/' + insertedChapter.lastInsertRowId + '/index.html',
      chapterText,
    );
    return;
  }
  throw new Error(getString('advancedSettingsScreen.chapterInsertFailed'));
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

  const epubFilePath =
    NativeFile.getConstants().ExternalCachesDirectoryPath + '/novel.epub';
  NativeFile.copyFile(uri, epubFilePath);
  const epubDirPath =
    NativeFile.getConstants().ExternalCachesDirectoryPath + '/epub';
  if (NativeFile.exists(epubDirPath)) {
    NativeFile.unlink(epubDirPath);
  }
  NativeFile.mkdir(epubDirPath);
  await NativeZipArchive.unzip(epubFilePath, epubDirPath);
  const novel = NativeEpub.parseNovelAndChapters(epubDirPath);
  if (!novel.name) {
    novel.name = filename.replace('.epub', '') || 'Untitled';
  }
  const novelId = await insertLocalNovel(
    novel.name,
    epubDirPath + novel.name, // temporary
    novel.cover || '',
    novel.author || '',
    novel.artist || '',
    novel.summary || '',
  );
  const now = dayjs().toISOString();
  if (novel.chapters) {
    for (let i = 0; i < novel.chapters?.length; i++) {
      const chapter = novel.chapters[i];
      if (!chapter.name) {
        chapter.name = chapter.path.split(/[\\/]/).pop() || 'unknown';
      }

      setMeta(meta => ({
        ...meta,
        progressText: chapter.name,
      }));

      await insertLocalChapter(novelId, i, chapter.name, chapter.path, now);

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

  for (const filePath of novel.imagePaths) {
    if (NativeFile.exists(filePath)) {
      NativeFile.moveFile(
        filePath,
        novelDir + '/' + filePath.split(/[\\/]/).pop(),
      );
    }
  }

  for (const filePath of novel.cssPaths) {
    if (NativeFile.exists(filePath)) {
      NativeFile.moveFile(
        filePath,
        novelDir + '/' + filePath.split(/[\\/]/).pop(),
      );
    }
  }

  setMeta(meta => ({
    ...meta,
    progress: 1,
    isRunning: false,
  }));
};
