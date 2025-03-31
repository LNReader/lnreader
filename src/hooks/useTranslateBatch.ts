import { useCallback } from 'react';
import { useTranslationSettings } from '@hooks/persisted/useSettings';
import { translateText } from '@services/translation/TranslationService';
import { saveTranslation } from '@database/queries/TranslationQueries';
import { showToast } from '@utils/showToast';
import FileManager from '@native/FileManager';
import { NOVEL_STORAGE } from '@utils/Storages';
import ServiceManager from '@services/ServiceManager';

export const useTranslateBatch = () => {
  const { apiKey, defaultInstruction, model } = useTranslationSettings();

  // Utility function to wait for multiple files to download
  const waitForDownloadsToComplete = async (
    downloadPaths: string[],
    progressCallback?: (completed: number, total: number) => void,
    maxWaitTimeMs = 60000, // 1 minute maximum wait time
  ) => {
    const startTime = Date.now();
    const pending = [...downloadPaths];
    let completed = 0;

    // Initial check - some files might already exist
    for (let i = pending.length - 1; i >= 0; i--) {
      const exists = await FileManager.exists(pending[i]);
      if (exists) {
        pending.splice(i, 1);
        completed++;
        progressCallback?.(completed, downloadPaths.length);
      }
    }

    if (pending.length === 0) {
      return true;
    } // All files already exist

    // Begin polling for remaining files
    while (pending.length > 0) {
      // Check if we've exceeded the maximum wait time
      if (Date.now() - startTime > maxWaitTimeMs) {
        console.log(
          `Exceeded maximum wait time (${maxWaitTimeMs}ms) for downloads`,
        );
        return false;
      }

      // Check each pending file
      for (let i = pending.length - 1; i >= 0; i--) {
        const exists = await FileManager.exists(pending[i]);
        if (exists) {
          pending.splice(i, 1);
          completed++;
          progressCallback?.(completed, downloadPaths.length);
        }
      }

      // If all downloads complete, exit early
      if (pending.length === 0) {
        return true;
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return true;
  };

  const translateChapters = useCallback(
    async (items: any[]) => {
      if (!apiKey) {
        showToast('Please enter an OpenRouter API key in settings');
        return 0;
      }

      if (items.length === 0) {
        showToast('No chapters selected for translation');
        return 0;
      }

      showToast(`Processing ${items.length} chapters...`);

      // Group chapters by novel for batch processing
      const novelChapters: Record<string, { novel: any; chapters: any[] }> = {};

      // Organize chapters by novel
      for (const item of items) {
        if (!item.novelId) {
          continue;
        }

        const novelKey = `${item.novelId}`;
        if (!novelChapters[novelKey]) {
          novelChapters[novelKey] = {
            novel: {
              id: item.novelId,
              name: item.novelName || item.novelTitle || 'Unknown Novel',
              pluginId: item.pluginId || item.plugin || 'unknown',
            },
            chapters: [],
          };
        }

        // Ensure each chapter has the right IDs
        const chapterId = item.id || item.chapterId;
        if (!chapterId) {
          continue;
        }

        novelChapters[novelKey].chapters.push({
          ...item,
          id: chapterId,
          chapterId: chapterId,
        });
      }

      let totalTranslated = 0;
      let totalDownloads = 0;

      // Process each novel's chapters
      for (const novelKey in novelChapters) {
        const { novel, chapters } = novelChapters[novelKey];

        // Check for chapters that need downloading
        const chapterFilePaths = chapters.map(chapter => {
          return `${NOVEL_STORAGE}/${novel.pluginId}/${novel.id}/${chapter.id}/index.html`;
        });

        const fileExistsPromises = chapterFilePaths.map(filePath =>
          FileManager.exists(filePath),
        );
        const existsResults = await Promise.all(fileExistsPromises);

        const chaptersToDownload = chapters.filter(
          (_, index) => !existsResults[index],
        );
        const downloadFilePaths = chaptersToDownload.map(
          chapter =>
            `${NOVEL_STORAGE}/${novel.pluginId}/${novel.id}/${chapter.id}/index.html`,
        );

        // Download any chapters that need it
        if (chaptersToDownload.length > 0) {
          showToast(`Downloading ${chaptersToDownload.length} chapter(s)...`);
          totalDownloads += chaptersToDownload.length;

          // Queue all downloads
          for (const chapter of chaptersToDownload) {
            try {
              ServiceManager.manager.addTask({
                name: 'DOWNLOAD_CHAPTER',
                data: {
                  chapterId: chapter.id,
                  novelName: novel.name,
                  chapterName:
                    chapter.name ||
                    chapter.chapterTitle ||
                    `Chapter ${chapter.id}`,
                },
              });
            } catch (error) {
              console.error('Error queueing chapter download:', error);
            }
          }

          // Wait for downloads to complete using our new callback mechanism
          let downloadProgress = 0;
          showToast(
            `Waiting for ${chaptersToDownload.length} downloads to complete...`,
          );

          const allDownloaded = await waitForDownloadsToComplete(
            downloadFilePaths,
            (completed, total) => {
              if (completed > downloadProgress) {
                downloadProgress = completed;
                console.log(`Download progress: ${completed}/${total}`);
              }
            },
            120000, // 2 minutes max wait time
          );

          if (!allDownloaded) {
            showToast(
              'Some downloads did not complete. Proceeding with available chapters.',
            );
          }
        }

        // Now translate all chapters
        for (const chapter of chapters) {
          try {
            const filePath = `${NOVEL_STORAGE}/${novel.pluginId}/${novel.id}/${chapter.id}/index.html`;

            // Double-check file exists even after download attempts
            if (!(await FileManager.exists(filePath))) {
              console.warn(
                `Chapter ${chapter.id} not available for translation, skipping`,
              );
              continue;
            }

            // Read content and translate
            const chapterContent = await FileManager.readFile(filePath);
            if (!chapterContent || chapterContent.trim() === '') {
              console.warn(`Chapter ${chapter.id} content is empty, skipping`);
              continue;
            }

            const translationResult = await translateText(
              apiKey,
              chapterContent,
              model,
              defaultInstruction,
            );

            // Format content and save translation
            const processedContent = translationResult.content
              .replace(/\n/g, '<br/>')
              .replace(/ {2}/g, '&nbsp;&nbsp;');

            await saveTranslation(
              chapter.id,
              processedContent,
              translationResult.model,
              translationResult.instruction,
            );

            totalTranslated++;
          } catch (error) {
            console.error('Error translating chapter:', error);
          }
        }
      }

      if (totalDownloads > 0) {
        showToast(`Downloaded ${totalDownloads} chapter(s)`);
      }

      return totalTranslated;
    },
    [apiKey, model, defaultInstruction],
  );

  return { translateChapters };
};
