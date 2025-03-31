import { db } from '@database/db';
import { txnErrorCallback } from '@database/utils/helpers';
import { showToast } from '@utils/showToast';
import { noop } from 'lodash-es';
import { TranslationInfo, NovelGroupedTranslations } from '../types';

export const saveTranslation = async (
  chapterId: number,
  content: string,
  model: string,
  instruction: string,
): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Translation (chapterId, content, model, instruction) 
         VALUES (?, ?, ?, ?)
         ON CONFLICT(chapterId) DO UPDATE SET
         content = ?, model = ?, instruction = ?, createdAt = CURRENT_TIMESTAMP`,
        [chapterId, content, model, instruction, content, model, instruction],
        (_, { insertId, rowsAffected }) => {
          // Update the Chapter table to mark that this chapter has a translation
          tx.executeSql(
            'UPDATE Chapter SET hasTranslation = 1 WHERE id = ?',
            [chapterId],
            noop,
            txnErrorCallback,
          );
          resolve(insertId || rowsAffected);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getTranslation = async (
  chapterId: number,
): Promise<TranslationInfo | null> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Translation WHERE chapterId = ?',
        [chapterId],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            resolve(null);
          }
        },
        txnErrorCallback,
      );
    });
  });
};

export const deleteTranslation = async (chapterId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM Translation WHERE chapterId = ?',
        [chapterId],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            // Update the Chapter table to mark that this chapter no longer has a translation
            tx.executeSql(
              'UPDATE Chapter SET hasTranslation = 0 WHERE id = ?',
              [chapterId],
              noop,
              txnErrorCallback,
            );
            showToast('Translation deleted');
            resolve();
          } else {
            reject(new Error('No translation found with that ID'));
          }
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const deleteAllTranslations = async (): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM Translation',
        [],
        (_, { rowsAffected }) => {
          // Update all chapters to mark that they no longer have a translation
          tx.executeSql(
            'UPDATE Chapter SET hasTranslation = 0',
            [],
            noop,
            txnErrorCallback,
          );
          showToast(`All translations deleted (${rowsAffected})`);
          resolve(rowsAffected);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getChaptersWithTranslation = async (
  novelId: number,
): Promise<number[]> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT id FROM Chapter WHERE novelId = ? AND hasTranslation = 1',
        [novelId],
        (_, { rows }) => {
          const chapterIds = [];
          for (let i = 0; i < rows.length; i++) {
            chapterIds.push(rows.item(i).id);
          }
          resolve(chapterIds);
        },
        txnErrorCallback,
      );
    });
  });
};

export const getAllTranslations = async (): Promise<
  Array<TranslationInfo & { novelName: string; chapterName: string }>
> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT t.*, c.name as chapterName, n.name as novelName, n.cover as novelCover 
         FROM Translation t
         JOIN Chapter c ON t.chapterId = c.id
         JOIN Novel n ON c.novelId = n.id
         ORDER BY t.createdAt DESC`,
        [],
        (_, { rows }) => {
          const translations = [];
          for (let i = 0; i < rows.length; i++) {
            const item = rows.item(i);
            translations.push({
              ...item,
              previewText:
                item.content.substring(0, 50) +
                (item.content.length > 50 ? '...' : ''),
            });
          }
          resolve(translations);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getAllTranslationsByNovel = async (): Promise<
  NovelGroupedTranslations[]
> => {
  try {
    // Get all translations
    const translations = await getAllTranslations();

    // Bail early if no translations
    if (!translations || translations.length === 0) {
      console.log('No translations found to group by novel');
      return [];
    }

    // Group by novel name first, then by novelId as fallback
    const novelGroups = new Map<string, any[]>();

    // First pass - group translations by novel name
    translations.forEach(translation => {
      const novelName = translation.novelName || 'Unknown Novel';

      if (!novelGroups.has(novelName)) {
        novelGroups.set(novelName, []);
      }

      novelGroups.get(novelName)?.push(translation);
    });

    // Convert to our result format
    const result: NovelGroupedTranslations[] = [];

    // Counter for generated novel IDs (for novels without an ID)
    let nextNovelId = -1;

    // Second pass - create novel groups with chapters
    for (const [novelName, novelTranslations] of novelGroups.entries()) {
      // Find a consistent novelId for this group if possible
      // Use the first valid novelId found, or generate one if none exists
      const firstWithId = novelTranslations.find(t => t.novelId != null);
      const novelId = firstWithId?.novelId || nextNovelId--;
      const novelCover = firstWithId?.novelCover || null;

      const novelGroup: NovelGroupedTranslations = {
        novelId,
        novelTitle: novelName,
        novelCover,
        chapters: novelTranslations.map(t => ({
          id: t.id,
          chapterId: t.chapterId,
          novelId: novelId, // Use the consistent novelId we found or generated
          chapterTitle: t.chapterName || 'Unknown Chapter',
          novelTitle: t.novelName || 'Unknown Novel',
          novelCover: t.novelCover,
          content: t.content,
          previewText: t.previewText,
          model: t.model,
          createdAt: t.createdAt,
        })),
      };

      result.push(novelGroup);
    }

    console.log(
      `Grouped translations: ${result.length} novels with chapters:`,
      result.map(n => `${n.novelTitle}: ${n.chapters?.length || 0}`).join(', '),
    );

    return result;
  } catch (error) {
    console.error('Error grouping translations by novel:', error);
    return [];
  }
};
