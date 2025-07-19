import { BackupNovel, NovelInfo, ChapterInfo } from '@database/types';
import {
  getAllAsync,
  getFirstAsync,
  runAsync,
  transactionAsync,
  exclusiveTransactionAsync,
} from '@database/utils/helpers';
import { showToast } from '@utils/showToast';
import { db } from '@database/db';
export const insertNovelFromBackup = async (
  novelWithLibraryFlag: any,
): Promise<number | null> => {
  const novelKeys = Object.keys(novelWithLibraryFlag);
  const novelQuery = `
    INSERT INTO Novel
    (${novelKeys.join(',')})
    VALUES (${novelKeys.map(() => '?').join(',')})
  `;

  const novelValues = Object.values(novelWithLibraryFlag).map(value =>
    value === null || value === undefined ? null : value,
  ) as (string | number | null)[];

  try {
    const result = await db.runAsync(novelQuery, novelValues);
    return result.lastInsertRowId || null;
  } catch (error: any) {
    throw new Error(`Failed to insert novel: ${error.message}`);
  }
};

export const insertChaptersBulk = async (
  chapters: ChapterInfo[],
): Promise<void> => {
  if (!chapters || chapters.length === 0) return;

  const BULK_SIZE = 500;

  for (let i = 0; i < chapters.length; i += BULK_SIZE) {
    const batch = chapters.slice(i, i + BULK_SIZE);

    // First, fetch existing chapters to preserve their state
    const novelIds = [...new Set(batch.map(ch => ch.novelId))];
    const existingChaptersMap = new Map<string, ChapterInfo>();

    for (const novelId of novelIds) {
      const paths = batch
        .filter(ch => ch.novelId === novelId)
        .map(ch => ch.path);

      if (paths.length > 0) {
        const placeholders = paths.map(() => '?').join(',');
        const existingChapters = await getAllAsync<ChapterInfo>([
          `SELECT * FROM Chapter WHERE novelId = ? AND path IN (${placeholders})`,
          [novelId, ...paths],
        ]);

        for (const existing of existingChapters) {
          const key = `${existing.novelId}:${existing.path}`;
          existingChaptersMap.set(key, existing);
        }
      }
    }

    // Merge chapters: preserve read status and download status if better in current DB
    const mergedChapters = batch.map(backupChapter => {
      const key = `${backupChapter.novelId}:${backupChapter.path}`;
      const existing = existingChaptersMap.get(key);

      if (existing) {
        return {
          ...backupChapter,
          id: existing.id,
          unread: Math.min(backupChapter.unread ?? 1, existing.unread ?? 1),
          isDownloaded: Math.max(
            backupChapter.isDownloaded ?? 0,
            existing.isDownloaded ?? 0,
          ),
          bookmark: existing.bookmark || backupChapter.bookmark,
          readTime: existing.readTime || backupChapter.readTime,
          progress: existing.progress ?? backupChapter.progress,
        };
      }

      return backupChapter;
    });

    const chapterKeys = Object.keys(mergedChapters[0]);
    const placeholders = chapterKeys.map(() => '?').join(',');
    const transactions: [string, ...any[]][] = [];

    const valueGroups = mergedChapters.map(() => `(${placeholders})`).join(',');
    const bulkQuery = `INSERT OR REPLACE INTO Chapter (${chapterKeys.join(
      ',',
    )}) VALUES ${valueGroups}`;

    const allValues: (string | number | null)[] = [];
    for (const chapter of mergedChapters) {
      const chapterValues = Object.values(chapter).map(value =>
        value === null || value === undefined ? null : value,
      ) as (string | number | null)[];
      allValues.push(...chapterValues);
    }

    transactions.push([bulkQuery, ...allValues]);
    await transactionAsync(transactions);
  }
};

export const updateNovelFromBackup = async (
  novelId: number,
  backupNovelInfo: Partial<NovelInfo>,
): Promise<void> => {
  const updateFields = [];
  const updateValues = [];

  if (backupNovelInfo.name) {
    updateFields.push('name = ?');
    updateValues.push(backupNovelInfo.name);
  }
  if (backupNovelInfo.cover) {
    updateFields.push('cover = ?');
    updateValues.push(backupNovelInfo.cover);
  }
  if (backupNovelInfo.summary) {
    updateFields.push('summary = ?');
    updateValues.push(backupNovelInfo.summary);
  }
  if (backupNovelInfo.author) {
    updateFields.push('author = ?');
    updateValues.push(backupNovelInfo.author);
  }
  if (backupNovelInfo.artist) {
    updateFields.push('artist = ?');
    updateValues.push(backupNovelInfo.artist);
  }
  if (backupNovelInfo.genres) {
    updateFields.push('genres = ?');
    updateValues.push(backupNovelInfo.genres);
  }
  if (backupNovelInfo.status) {
    updateFields.push('status = ?');
    updateValues.push(backupNovelInfo.status);
  }
  if (backupNovelInfo.totalPages) {
    updateFields.push('totalPages = ?');
    updateValues.push(backupNovelInfo.totalPages);
  }

  if (updateFields.length === 0) return;

  updateValues.push(novelId);
  const updateQuery = `UPDATE Novel SET ${updateFields.join(
    ', ',
  )} WHERE id = ?`;

  await runAsync([[updateQuery, updateValues]]);
};

export const deleteChaptersByNovelId = async (
  novelId: number,
): Promise<void> => {
  await runAsync([['DELETE FROM Chapter WHERE novelId = ?', [novelId]]]);
};

export const recalculateNovelStats = async (novelId: number): Promise<void> => {
  await runAsync([
    [
      `UPDATE Novel
       SET
         chaptersDownloaded = (SELECT COUNT(*) FROM Chapter WHERE Chapter.novelId = ? AND Chapter.isDownloaded = 1),
         chaptersUnread = (SELECT COUNT(*) FROM Chapter WHERE Chapter.novelId = ? AND Chapter.unread = 1),
         totalChapters = (SELECT COUNT(*) FROM Chapter WHERE Chapter.novelId = ?),
         lastReadAt = (SELECT MAX(readTime) FROM Chapter WHERE Chapter.novelId = ?),
         lastUpdatedAt = (SELECT MAX(updatedTime) FROM Chapter WHERE Chapter.novelId = ?)
       WHERE id = ?`,
      [novelId, novelId, novelId, novelId, novelId, novelId],
    ],
  ]);
};

export const ensureNovelInLibrary = async (novelId: number): Promise<void> => {
  await runAsync([
    [
      'UPDATE Novel SET inLibrary = 1 WHERE id = ? AND inLibrary != 1',
      [novelId],
    ],
  ]);
};

export const findCategoryByName = async (name: string) => {
  return await getFirstAsync<{ id: number; sort: number }>([
    'SELECT id, sort FROM Category WHERE name = ?',
    [name],
  ]);
};

export const clearNovelCategoriesForCategory = async (
  categoryId: number,
): Promise<void> => {
  await runAsync([
    ['DELETE FROM NovelCategory WHERE categoryId = ?', [categoryId]],
  ]);
};

export const insertCategoryWithSort = async (
  name: string,
  sort: number,
): Promise<number | null> => {
  try {
    const result = await db.runAsync(
      'INSERT INTO Category (name, sort) VALUES (?, ?)',
      [name, sort],
    );
    return result.lastInsertRowId || null;
  } catch (error: any) {
    throw new Error(`Failed to insert category: ${error.message}`);
  }
};

export const insertNovelCategories = async (
  categoryId: number,
  novelIds: number[],
): Promise<void> => {
  if (novelIds.length === 0) return;

  const transactions: [string, ...any[]][] = [];
  for (const novelId of novelIds) {
    transactions.push([
      'INSERT OR IGNORE INTO NovelCategory (categoryId, novelId) VALUES (?, ?)',
      categoryId,
      novelId,
    ]);
  }

  await transactionAsync(transactions);
};

export const getOrCreateDefaultCategory = async (): Promise<{
  id: number;
} | null> => {
  let defaultCategory = await getFirstAsync<{ id: number }>([
    'SELECT id FROM Category WHERE name = ?',
    ['Default'],
  ]);

  if (!defaultCategory) {
    const categoryId = await insertCategoryWithSort('Default', 0);
    if (categoryId) {
      defaultCategory = { id: categoryId };
    }
  }

  return defaultCategory;
};

export const getNovelsWithoutCategory = async () => {
  return await getAllAsync<{ id: number; name: string }>([
    `SELECT n.id, n.name 
     FROM Novel n 
     WHERE n.inLibrary = 1 
     AND n.id NOT IN (SELECT DISTINCT novelId FROM NovelCategory)`,
  ]);
};

export const assignNovelsToDefaultCategory = async (
  defaultCategoryId: number,
  novelIds: number[],
): Promise<void> => {
  if (novelIds.length === 0) return;

  const transactions: [string, ...any[]][] = [];
  for (const novelId of novelIds) {
    transactions.push([
      'INSERT OR IGNORE INTO NovelCategory (categoryId, novelId) VALUES (?, ?)',
      defaultCategoryId,
      novelId,
    ]);
  }

  await transactionAsync(transactions);
};

export const restoreNovelAndChaptersTransaction = async (
  backupNovel: BackupNovel,
): Promise<number | null> => {
  const { chapters, ...novel } = backupNovel;
  let novelId: number | null = null;

  await exclusiveTransactionAsync(async () => {
    const novelWithLibraryFlag = { ...novel, inLibrary: 1 };
    novelId = await insertNovelFromBackup(novelWithLibraryFlag);

    if (chapters && chapters.length > 0 && novelId) {
      const chaptersWithNovelId = chapters.map(chapter => ({
        ...chapter,
        novelId: novelId,
      })) as ChapterInfo[];
      await insertChaptersBulk(chaptersWithNovelId);
      await recalculateNovelStats(novelId);
    }
  });

  return novelId;
};

export const mergeNovelAndChaptersTransaction = async (
  backupNovel: BackupNovel,
  existingNovelId: number,
  shouldUpdateNovel: boolean,
): Promise<void> => {
  const { chapters: backupChapters, ...backupNovelInfo } = backupNovel;

  await exclusiveTransactionAsync(async () => {
    if (shouldUpdateNovel) {
      await updateNovelFromBackup(existingNovelId, backupNovelInfo);
    }

    if (backupChapters && backupChapters.length > 0) {
      const chaptersWithNovelId = backupChapters.map(chapter => ({
        ...chapter,
        novelId: existingNovelId,
      })) as ChapterInfo[];
      await insertChaptersBulk(chaptersWithNovelId);
      await recalculateNovelStats(existingNovelId);
    }

    await ensureNovelInLibrary(existingNovelId);
  });
};

export const restoreCategoryTransaction = async (
  category: any,
): Promise<void> => {
  await exclusiveTransactionAsync(async () => {
    const existingCategory = await findCategoryByName(category.name);
    let categoryId = category.id;

    if (existingCategory) {
      categoryId = existingCategory.id;
      await clearNovelCategoriesForCategory(categoryId);
    } else {
      const newCategoryId = await insertCategoryWithSort(
        category.name,
        category.sort || 0,
      );
      if (newCategoryId) {
        categoryId = newCategoryId;
      }
    }

    if (category.novelIds && category.novelIds.length > 0) {
      await insertNovelCategories(categoryId, category.novelIds);
    }
  });
};

export const ensureNovelsHaveDefaultCategory = async (): Promise<void> => {
  try {
    const defaultCategory = await getOrCreateDefaultCategory();

    if (!defaultCategory) {
      throw new Error('Failed to create default category');
    }

    const novelsWithoutCategory = await getNovelsWithoutCategory();

    if (novelsWithoutCategory.length > 0) {
      const novelIds = novelsWithoutCategory.map(novel => novel.id);
      await assignNovelsToDefaultCategory(defaultCategory.id, novelIds);
    }
  } catch (error: any) {
    showToast(`Failed to assign default categories: ${error.message}`);
    throw error;
  }
};
