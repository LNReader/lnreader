import { translateText } from './TranslationService';
import { saveTranslation } from '@database/queries/TranslationQueries';
import FileManager from '@native/FileManager';
import { NOVEL_STORAGE } from '@utils/Storages';
import { showToast } from '@utils/showToast';
import { Alert } from 'react-native';
import ServiceManager, { DownloadChapterTask } from '@services/ServiceManager';
import { db } from '@database/db';

/**
 * Batch translate multiple chapters
 *
 * @param chapters Array of chapters to translate
 * @param novel Novel info
 * @param apiKey OpenRouter API key
 * @param model AI model to use
 * @param instruction Translation instruction
 * @returns Promise with number of successfully translated chapters
 */
export const batchTranslateChapters = async (
  chapters: any[],
  novel: any,
  apiKey: string,
  model: string,
  instruction: string,
): Promise<number> => {
  if (!apiKey) {
    showToast('Please enter an OpenRouter API key in settings');
    return 0;
  }

  // Make sure all chapters have necessary IDs
  const normalizedChapters = chapters.map(chapter => ({
    ...chapter,
    id: chapter.id || chapter.chapterId,
    chapterId: chapter.chapterId || chapter.id,
    pluginId: chapter.pluginId || novel.pluginId,
  }));

  // SIMPLIFIED APPROACH: Download ALL chapters regardless of status
  return new Promise(resolve => {
    Alert.alert(
      'Download & Translate',
      `All ${chapters.length} chapter(s) will be downloaded (if needed) and then translated. Continue?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(0),
        },
        {
          text: 'Proceed',
          onPress: async () => {
            try {
              // Check which chapters need to be downloaded
              const chapterFilePaths = normalizedChapters.map(chapter => {
                return `${NOVEL_STORAGE}/${novel.pluginId}/${novel.id}/${chapter.id}/index.html`;
              });

              const fileExistsPromises = chapterFilePaths.map(filePath =>
                FileManager.exists(filePath),
              );
              const existsResults = await Promise.all(fileExistsPromises);

              const chaptersToDownload = normalizedChapters.filter(
                (chapter, index) => !existsResults[index],
              );

              // Only show download toast if there are chapters to download
              if (chaptersToDownload.length > 0) {
                showToast(
                  `Downloading ${chaptersToDownload.length} chapters...`,
                );

                // First download attempt
                await attemptDownloadChapters(chaptersToDownload, novel);

                // After wait completes, proceed with translation
                showToast('Processing translations...');
              } else {
                showToast('Processing translations...');
              }

              // Verify files exist before translation and collect all chapters that are now downloaded
              const readyForTranslation = [];

              // Check all chapters to make sure they're downloaded now
              for (const chapter of normalizedChapters) {
                const chapterId = chapter.id || chapter.chapterId;
                const filePath = `${NOVEL_STORAGE}/${novel.pluginId}/${novel.id}/${chapterId}/index.html`;
                const exists = await FileManager.exists(filePath);

                if (exists) {
                  readyForTranslation.push(chapter);
                }
              }

              const translatedCount = await processTranslations(
                readyForTranslation,
                novel,
                apiKey,
                model,
                instruction,
              );
              resolve(translatedCount);
            } catch (error) {
              showToast('Error during download/translation process');
              resolve(0);
            }
          },
        },
      ],
      { cancelable: true },
    );
  });
};

// Helper function to process translations after ensuring chapters are downloaded
const processTranslations = async (
  chapters: any[],
  novel: any,
  apiKey: string,
  model: string,
  instruction: string,
): Promise<number> => {
  let successCount = 0;

  // Process chapters sequentially to avoid rate limiting
  for (const chapter of chapters) {
    try {
      // Handle both id and chapterId properties
      const chapterId = chapter.id || chapter.chapterId;
      if (!chapterId) {
        continue;
      }

      // Check if chapter already has a translation
      const hasTranslation = await checkIfChapterHasTranslation(chapterId);
      if (hasTranslation) {
        continue;
      }

      const filePath = `${NOVEL_STORAGE}/${novel.pluginId}/${novel.id}/${chapterId}/index.html`;

      // Read the chapter content
      const chapterContent = await FileManager.readFile(filePath);

      if (!chapterContent || chapterContent.trim() === '') {
        continue;
      }

      // Translate the content
      const translationResult = await translateText(
        apiKey,
        chapterContent,
        model,
        instruction,
      );

      // Process the translated content to preserve line breaks
      const processedContent = translationResult.content
        .replace(/\n/g, '<br/>') // Replace newlines with <br/> tags
        .replace(/ {2}/g, '&nbsp;&nbsp;'); // Replace double spaces with non-breaking spaces

      // Save the translation to the database
      await saveTranslation(
        chapterId,
        processedContent,
        translationResult.model,
        translationResult.instruction,
      );

      // Update the hasTranslation flag in the Chapter table
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE Chapter SET hasTranslation = 1 WHERE id = ?',
          [chapterId],
          () => {},
          (_: any, _error: any) => {
            return false;
          },
        );
      });

      successCount++;
    } catch (error) {
      // Continue with next chapter on error
    }
  }

  if (successCount > 0) {
    showToast(
      `Translation complete: ${successCount} of ${chapters.length} chapters translated`,
    );
  } else {
    showToast('No chapters were translated. Please check the logs for errors.');
  }

  return successCount;
};

// Helper function to check if a chapter already has a translation
const checkIfChapterHasTranslation = async (
  chapterId: number,
): Promise<boolean> => {
  return new Promise<boolean>(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT hasTranslation FROM Chapter WHERE id = ?',
        [chapterId],
        (_, result) => {
          if (result.rows.length > 0) {
            const hasTranslation = result.rows.item(0).hasTranslation === 1;
            resolve(hasTranslation);
          } else {
            resolve(false);
          }
        },
        (_, _error) => {
          resolve(false);
          return false;
        },
      );
    });
  });
};

// Helper function to handle downloading chapters with retry logic
const attemptDownloadChapters = async (
  chaptersToDownload: any[],
  novel: any,
  retryAttempt: number = 0,
): Promise<void> => {
  if (chaptersToDownload.length === 0) {
    return;
  }

  const MAX_RETRIES = 2;
  const POLL_INTERVAL = 3000; // Check every 3 seconds
  const MAX_WAIT_TIME = 60000; // 1 minute max

  // Queue chapters for download
  const chapterIdsBeingDownloaded: number[] = [];
  const chapterFilePaths: { id: number; path: string }[] = [];

  for (const chapter of chaptersToDownload) {
    try {
      // Get appropriate chapter ID
      const chapterId = chapter.id || chapter.chapterId;
      if (!chapterId) {
        continue;
      }

      const filePath = `${NOVEL_STORAGE}/${novel.pluginId}/${novel.id}/${chapterId}/index.html`;
      chapterFilePaths.push({ id: chapterId, path: filePath });

      chapterIdsBeingDownloaded.push(chapterId);

      // Add the download task to ServiceManager
      ServiceManager.manager.addTask({
        name: 'DOWNLOAD_CHAPTER',
        data: {
          chapterId: chapterId,
          novelName: novel.name || 'Unknown Novel',
          chapterName:
            chapter.name || chapter.chapterName || `Chapter ${chapterId}`,
        },
      });
    } catch (error) {
      // Continue with next chapter on error
    }
  }

  if (chapterIdsBeingDownloaded.length === 0) {
    return; // Nothing to download
  }

  const startTime = Date.now();
  try {
    let queueEmpty = false;

    // Wait until all downloads are out of the queue
    while (!queueEmpty && Date.now() - startTime < MAX_WAIT_TIME) {
      // Check if any of our chapters are still in the download queue
      const pendingDownloads = await areChaptersStillDownloading(
        chapterIdsBeingDownloaded,
      );

      if (!pendingDownloads) {
        queueEmpty = true;
        break;
      }

      // Wait for a bit before checking again
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }

    // Additional verification: check if files actually exist after download queue is clear
    await new Promise(resolve => setTimeout(resolve, 3000)); // Short delay to ensure filesystem is updated

    // Check which files successfully downloaded
    const failedDownloads: any[] = [];
    for (const chapter of chaptersToDownload) {
      const chapterId = chapter.id || chapter.chapterId;
      const filePath = `${NOVEL_STORAGE}/${novel.pluginId}/${novel.id}/${chapterId}/index.html`;

      const exists = await FileManager.exists(filePath);

      if (!exists) {
        failedDownloads.push(chapter);
      }
    }

    // If any downloads failed and we haven't exceeded max retries, try again
    if (failedDownloads.length > 0 && retryAttempt < MAX_RETRIES) {
      showToast(`Retrying ${failedDownloads.length} failed downloads...`);
      await attemptDownloadChapters(failedDownloads, novel, retryAttempt + 1);
    } else if (failedDownloads.length > 0) {
      showToast(`${failedDownloads.length} chapters failed to download`);
    }
  } catch (error) {
    // Handle error silently
  }
};

// Helper function to check if any of our chapters are still in the download queue
const areChaptersStillDownloading = async (
  chapterIds: number[],
): Promise<number> => {
  const taskList = ServiceManager.manager.getTaskList();

  // Look for any download tasks for our chapter IDs
  const pendingDownloads = taskList.filter(task => {
    if (task.task.name === 'DOWNLOAD_CHAPTER') {
      const downloadTask = task.task as DownloadChapterTask;
      return chapterIds.includes(downloadTask.data.chapterId);
    }
    return false;
  });

  return pendingDownloads.length;
};
