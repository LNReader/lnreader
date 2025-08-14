import { fetchNovel, fetchPage } from '../plugin/fetch';
import { ChapterItem, SourceNovel } from '@plugins/types';
import { getPlugin, LOCAL_PLUGIN_ID } from '@plugins/pluginManager';
import { NOVEL_STORAGE } from '@utils/Storages';
import { downloadFile } from '@plugins/helpers/fetch';
import ServiceManager from '@services/ServiceManager';
import { db } from '@database/db';
import NativeFile from '@specs/NativeFile';

const updateNovelMetadata = async (
  pluginId: string,
  novelId: number,
  novel: SourceNovel,
) => {
  const { name, summary, author, artist, genres, status, totalPages } = novel;
  let cover = novel.cover;
  const novelDir = NOVEL_STORAGE + '/' + pluginId + '/' + novelId;
  if (NativeFile.exists(novelDir)) {
    NativeFile.mkdir(novelDir);
  }
  if (cover) {
    const novelCoverPath = novelDir + '/cover.png';
    const novelCoverUri = 'file://' + novelCoverPath;
    downloadFile(cover, novelCoverPath, getPlugin(pluginId)?.imageRequestInit);
    cover = novelCoverUri + '?' + Date.now();
  }

  db.runSync(
    `UPDATE Novel SET 
          name = ?, cover = ?, summary = ?, author = ?, artist = ?, 
          genres = ?, status = ?, totalPages = ?
          WHERE id = ?
        `,
    [
      name,
      cover || null,
      summary || null,
      author || 'unknown',
      artist || null,
      genres || null,
      status || null,
      totalPages || 0,
      novelId,
    ],
  );
};

const updateNovelTotalPages = (novelId: number, totalPages: number) => {
  db.runSync('UPDATE Novel SET totalPages = ? WHERE id = ?', [
    totalPages,
    novelId,
  ]);
};

const updateNovelChapters = (
  novelName: string,
  novelId: number,
  chapters: ChapterItem[],
  downloadNewChapters?: boolean,
  page?: string,
) =>
  db.withExclusiveTransactionAsync(async tx => {
    for (let position = 0; position < chapters.length; position++) {
      const {
        name,
        path,
        releaseTime,
        page: customPage,
        chapterNumber,
      } = chapters[position];
      const chapterPage = page || customPage || '1';
      const st = await tx.prepareAsync(
        `
          INSERT INTO Chapter (path, name, releaseTime, novelId, updatedTime, chapterNumber, page, position)
          SELECT ?, ?, ?, ?, datetime('now','localtime'), ?, ?, ?
          WHERE NOT EXISTS (SELECT id FROM Chapter WHERE path = ? AND novelId = ?);
        `,
      );
      let insertId = -1;
      try {
        const result = await st.executeAsync([
          path,
          name,
          releaseTime || null,
          novelId,
          chapterNumber || null,
          chapterPage,
          position,
          path,
          novelId,
        ]);
        insertId = result.lastInsertRowId;
      } finally {
        await st.finalizeAsync();
      }

      if (insertId && insertId >= 0) {
        if (downloadNewChapters) {
          ServiceManager.manager.addTask({
            name: 'DOWNLOAD_CHAPTER',
            data: {
              chapterId: insertId,
              novelName: novelName,
              chapterName: name,
            },
          });
        }
      } else {
        await tx.runAsync(
          `
              UPDATE Chapter SET
                name = ?, releaseTime = ?, updatedTime = datetime('now','localtime'), page = ?, position = ?
              WHERE path = ? AND novelId = ? AND (name != ? OR releaseTime != ? OR page != ? OR position != ?);
            `,
          [
            name,
            releaseTime || null,
            chapterPage,
            position,
            path,
            novelId,
            name,
            releaseTime || null,
            chapterPage,
            position,
          ],
        );
      }
    }
  });
export interface UpdateNovelOptions {
  downloadNewChapters?: boolean;
  refreshNovelMetadata?: boolean;
}

const updateNovel = async (
  pluginId: string,
  novelPath: string,
  novelId: number,
  options: UpdateNovelOptions,
) => {
  if (pluginId === LOCAL_PLUGIN_ID) {
    return;
  }
  const { downloadNewChapters, refreshNovelMetadata } = options;
  const novel = await fetchNovel(pluginId, novelPath);

  if (refreshNovelMetadata) {
    await updateNovelMetadata(pluginId, novelId, novel);
  } else if (novel.totalPages) {
    // at least update totalPages,
    updateNovelTotalPages(novelId, novel.totalPages);
  }

  await updateNovelChapters(
    novel.name,
    novelId,
    novel.chapters || [],
    downloadNewChapters,
  );
};

const updateNovelPage = async (
  pluginId: string,
  novelPath: string,
  novelId: number,
  page: string,
  options: Pick<UpdateNovelOptions, 'downloadNewChapters'>,
) => {
  const { downloadNewChapters } = options;
  const sourcePage = await fetchPage(pluginId, novelPath, page);
  updateNovelChapters(
    pluginId,
    novelId,
    sourcePage.chapters || [],
    downloadNewChapters,
    page,
  );
};

export { updateNovel, updateNovelPage };
