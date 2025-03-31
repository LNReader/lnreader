import { useCallback, useState, useEffect } from 'react';
import { useTranslationSettings } from '@hooks/persisted/useSettings';
import { translateText } from '@services/translation/TranslationService';
import {
  saveTranslation,
  getTranslation,
  deleteTranslation,
} from '@database/queries/TranslationQueries';
import { ChapterInfo } from '@database/types';
import FileManager from '@native/FileManager';
import { NOVEL_STORAGE } from '@utils/Storages';
import { showToast } from '@utils/showToast';
import { getString } from '@strings/translations';
import ServiceManager from '@services/ServiceManager';
import { db } from '@database/db';

export const useTranslation = (chapterId: number) => {
  const { apiKey, defaultInstruction, model } = useTranslationSettings();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationContent, setTranslationContent] = useState<string | null>(
    null,
  );
  const [showTranslation, setShowTranslation] = useState(false);

  // Safe version of getString that handles missing translations
  const safeGetString = (key: any, options?: any) => {
    try {
      // Using any type to bypass TypeScript checking for keys
      return getString(key as any, options);
    } catch (error) {
      return key.split('.').pop() || 'ERROR';
    }
  };

  const checkTranslation = useCallback(async () => {
    if (!chapterId) {
      return false;
    }

    try {
      const translation = await getTranslation(chapterId);
      if (translation && translation.content) {
        setTranslationContent(translation.content);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, [chapterId]);

  // Reset translation state when chapterId changes
  useEffect(() => {
    // Reset translation state
    setTranslationContent(null);
    setShowTranslation(false);

    // Check if this chapter has a translation
    if (chapterId) {
      // Use the checkTranslation function via the callback
      checkTranslation().catch(_error => {
        // Silently handle error
      });
    }
  }, [chapterId, checkTranslation]);

  const translateChapter = useCallback(
    async (
      chapter: ChapterInfo,
      novel: { pluginId: string; id: number; name?: string },
    ) => {
      if (!apiKey) {
        showToast(safeGetString('translation.noApiKey'));
        return;
      }

      // Safety checks
      if (!chapter || !novel || !novel.pluginId || !novel.id || !chapter.id) {
        showToast(
          safeGetString('common.error') + ': Invalid chapter or novel data',
        );
        return;
      }

      setIsTranslating(true);

      try {
        // Check if chapter is downloaded
        const filePath = `${NOVEL_STORAGE}/${novel.pluginId}/${novel.id}/${chapter.id}/index.html`;

        const fileExists = await FileManager.exists(filePath);
        if (!fileExists) {
          // If the file doesn't exist, we need to download it first
          showToast('Downloading chapter first...');

          try {
            // Add to ServiceManager
            ServiceManager.manager.addTask({
              name: 'DOWNLOAD_CHAPTER',
              data: {
                chapterId: chapter.id,
                novelName: novel.name || 'Unknown Novel',
                chapterName: chapter.name || `Chapter ${chapter.id}`,
              },
            });

            // Wait for file to exist with periodic checks
            let downloadSuccessful = false;
            let attempts = 0;
            const maxAttempts = 30; // 30 attempts * 2 seconds = up to 1 minute wait

            while (!downloadSuccessful && attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
              downloadSuccessful = await FileManager.exists(filePath);
              attempts++;
            }

            if (!downloadSuccessful) {
              throw new Error('Download timeout');
            }

            showToast('Download complete, starting translation...');
          } catch (downloadError) {
            console.error('Error downloading chapter:', downloadError);
            showToast('Error downloading chapter');
            setIsTranslating(false);
            return;
          }
        }

        // Read the chapter content
        const chapterContent = await FileManager.readFile(filePath);

        if (!chapterContent || chapterContent.trim() === '') {
          throw new Error('Chapter content is empty');
        }

        // Translate the content
        const translationResult = await translateText(
          apiKey,
          chapterContent,
          model,
          defaultInstruction,
        );

        // Process the translated content to preserve line breaks
        const processedContent = translationResult.content
          .replace(/\n/g, '<br/>') // Replace newlines with <br/> tags
          .replace(/ {2}/g, '&nbsp;&nbsp;'); // Replace double spaces with non-breaking spaces

        // Save the processed translation to the database
        await saveTranslation(
          chapter.id,
          processedContent,
          translationResult.model,
          translationResult.instruction,
        );

        // Also update the hasTranslation flag in the Chapter table
        db.transaction(tx => {
          tx.executeSql(
            'UPDATE Chapter SET hasTranslation = 1 WHERE id = ?',
            [chapter.id],
            () => {},
            (_, _error) => {
              return false;
            },
          );
        });

        // Update the state with the translation
        setTranslationContent(processedContent);
        setShowTranslation(true);
        showToast(safeGetString('translation.success'));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        showToast(safeGetString('translation.error', { error: errorMessage }));
      } finally {
        setIsTranslating(false);
      }
    },
    [apiKey, defaultInstruction, model, safeGetString],
  );

  const toggleTranslation = useCallback(async () => {
    try {
      if (!translationContent) {
        // If we don't have a translation loaded yet, try to get it from the database
        const hasTranslation = await checkTranslation();
        if (hasTranslation) {
          setShowTranslation(true);
        } else {
          showToast(safeGetString('translation.noTranslation'));
        }
      } else {
        // Toggle between showing original and translation
        setShowTranslation(!showTranslation);
      }
    } catch (error) {
      // Silently handle error
    }
  }, [translationContent, showTranslation, checkTranslation, safeGetString]);

  const removeTranslation = useCallback(async () => {
    try {
      await deleteTranslation(chapterId);
      setTranslationContent(null);
      setShowTranslation(false);
      showToast(safeGetString('translation.deleted'));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      showToast(
        safeGetString('translation.deleteError', { error: errorMessage }),
      );
    }
  }, [chapterId, safeGetString]);

  const exportTranslation = useCallback(async () => {
    if (!translationContent) {
      showToast(safeGetString('translation.noTranslationToExport'));
      return;
    }

    try {
      const exportPath = `${NOVEL_STORAGE}/translations`;
      // Create directory if it doesn't exist
      await FileManager.mkdir(exportPath);

      // Convert HTML content to plain text for export
      const plainTextContent = translationContent
        .replace(/<br\s*\/?>/gi, '\n') // Convert <br> tags to newlines
        .replace(/&nbsp;&nbsp;/g, '  ') // Convert non-breaking spaces back to regular spaces
        .replace(/&nbsp;/g, ' ')
        .replace(/<[^>]*>/g, ''); // Remove any other HTML tags

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const exportFile = `${exportPath}/translation-${chapterId}-${timestamp}.txt`;

      await FileManager.writeFile(exportFile, plainTextContent);
      showToast(safeGetString('translation.exported', { path: exportFile }));

      // Return the export file path so it can be opened if needed
      return exportFile;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      showToast(
        safeGetString('translation.exportError', { error: errorMessage }),
      );
      return null;
    }
  }, [chapterId, translationContent, safeGetString]);

  return {
    isTranslating,
    translationContent,
    showTranslation,
    translateChapter,
    toggleTranslation,
    checkTranslation,
    removeTranslation,
    exportTranslation,
  };
};
