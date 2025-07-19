import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import dayjs from 'dayjs';
import { showToast } from '@utils/showToast';
import { getString } from '@strings/translations';
import {
  CACHE_DIR_PATH,
  prepareBackupData,
  restoreDataMerge,
  copyDirectoryRecursive,
} from '../utils';
import NativeFile from '@specs/NativeFile';
import NativeZipArchive from '@specs/NativeZipArchive';
import * as Clipboard from 'expo-clipboard';
import { getAllNovels } from '@database/queries/NovelQueries';
import { getDownloadedChapters } from '@database/queries/ChapterQueries';
import { getPlugin } from '@plugins/pluginManager';
import { NOVEL_STORAGE } from '@utils/Storages';
import { BackupNovel, NovelInfo } from '@database/types';
import { getFirstAsync, runAsync, getAllAsync } from '@database/utils/helpers';
import { BackupEntryName } from '../types';

export interface LocalRestoreResult {
  added: { name: string; reason: string }[];
  skipped: { name: string; reason: string }[];
  errored: { name: string; reason: string }[];
  overwritten: { name: string; reason: string }[];
  missingPlugins: string[];
}

interface BackupProgress {
  isRunning: boolean;
  progress?: number;
  progressText: string;
}

type MetaSetter = (transformer: (meta: any) => any) => void;

/**
 * Updates the progress metadata for backup/restore operations.
 */
const updateProgress = (
  setMeta: MetaSetter | undefined,
  updates: Partial<BackupProgress>,
): void => {
  if (setMeta) {
    setMeta(meta => ({ ...meta, ...updates }));
  }
};

/**
 * Validates storage permissions for backup operations.
 */
const validatePermissions = (permissions: any): void => {
  if (!permissions) {
    throw new Error('Permissions object is null');
  }

  if (!permissions.granted) {
    throw new Error('Storage permission not granted');
  }

  if (!permissions.directoryUri) {
    throw new Error('No directory URI in permissions');
  }

  if (typeof permissions.directoryUri !== 'string') {
    throw new Error(
      `Invalid directory URI type: ${typeof permissions.directoryUri}`,
    );
  }
};

/**
 * Requests directory permissions for backup operations.
 */
const requestDirectoryPermissions = async (
  preselectedDirectoryUri?: string,
): Promise<{ granted: boolean; directoryUri: string }> => {
  if (preselectedDirectoryUri) {
    return {
      granted: true,
      directoryUri: preselectedDirectoryUri,
    };
  }

  try {
    return await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Permission request failed: ${message}`);
  }
};

/**
 * Creates a backup ZIP archive with optional downloaded files.
 */
export const createBackup = async (
  includeDownloads: boolean = false,
  setMeta?: MetaSetter,
  preselectedDirectoryUri?: string,
): Promise<void> => {
  const datetime = dayjs().format('YYYY-MM-DD_HH_mm_ss');
  const fileName = `lnreader_backup_${datetime}.zip`;
  const uniqueCacheDir = `${CACHE_DIR_PATH}_backup_${datetime}`;
  const zipPath = `${uniqueCacheDir}.zip`;

  try {
    updateProgress(setMeta, {
      isRunning: true,
      progress: 0,
      progressText: getString('backupScreen.preparingData'),
    });

    // Request and validate permissions
    const permissions = await requestDirectoryPermissions(
      preselectedDirectoryUri,
    );
    validatePermissions(permissions);

    if (await NativeFile.exists(uniqueCacheDir)) {
      await NativeFile.unlink(uniqueCacheDir);
    }

    updateProgress(setMeta, {
      progress: 0.2,
      progressText: getString('backupScreen.preparingData'),
    });

    await prepareBackupData(uniqueCacheDir, includeDownloads);

    updateProgress(setMeta, {
      progress: 0.4,
      progressText: includeDownloads
        ? getString('backupScreen.downloadingDownloadedFiles')
        : getString('backupScreen.preparingData'),
    });

    if (includeDownloads) {
      await includeDownloadedFiles(uniqueCacheDir);
    } else {
      await includeCoversOnly(uniqueCacheDir);
    }

    updateProgress(setMeta, {
      progress: 0.7,
      progressText: 'Creating backup archive...',
    });

    await zipDirectory(uniqueCacheDir, zipPath);

    updateProgress(setMeta, {
      progress: 0.9,
      progressText: 'Saving backup file...',
    });

    const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
      permissions.directoryUri,
      fileName,
      'application/zip',
    );

    if (!(await NativeFile.exists(zipPath))) {
      throw new Error('Backup zip file was not created');
    }

    await NativeFile.copyFile(zipPath, fileUri);

    const backupTypeText = includeDownloads ? ' (with downloads)' : '';

    updateProgress(setMeta, {
      isRunning: false,
      progress: 1,
    });

    showToast(
      getString('backupScreen.backupCreated', { fileName }) + backupTypeText,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    updateProgress(setMeta, {
      isRunning: false,
      progress: undefined,
      progressText: `Backup failed: ${message}`,
    });

    showToast(`Backup failed: ${message}`);
  }
};

/**
 * Copies only novel cover images to backup directory.
 */
const includeCoversOnly = async (cacheDirPath: string): Promise<void> => {
  const novelsDirPath = `${cacheDirPath}/novels`;
  const allNovels = await getAllNovels();

  for (const novel of allNovels) {
    if (novel.cover?.startsWith('file://')) {
      const coverPath = novel.cover.replace('file://', '').split('?')[0];

      if (await NativeFile.exists(coverPath)) {
        const backupNovelPath = `${novelsDirPath}/${novel.pluginId}/${novel.id}`;

        if (!(await NativeFile.exists(backupNovelPath))) {
          await NativeFile.mkdir(backupNovelPath);
        }

        const backupCoverPath = `${backupNovelPath}/cover.png`;
        await NativeFile.copyFile(coverPath, backupCoverPath);
      }
    }
  }
};

/**
 * Copies downloaded chapter files to backup directory.
 */
const includeDownloadedFiles = async (cacheDirPath: string): Promise<void> => {
  const novelsDirPath = `${cacheDirPath}/novels`;
  const downloadedChapters = await getDownloadedChapters();

  for (const chapter of downloadedChapters) {
    const sourceChapterPath = `${NOVEL_STORAGE}/${chapter.pluginId}/${chapter.novelId}/${chapter.id}`;
    const backupChapterPath = `${novelsDirPath}/${chapter.pluginId}/${chapter.novelId}/${chapter.id}`;

    if (await NativeFile.exists(sourceChapterPath)) {
      await copyChapterFiles(sourceChapterPath, backupChapterPath);
    }
  }

  await includeCoversOnly(cacheDirPath);
};

/**
 * Copies HTML chapter files from source to destination.
 */
const copyChapterFiles = async (
  sourcePath: string,
  destPath: string,
): Promise<void> => {
  if (!(await NativeFile.exists(sourcePath))) {
    return;
  }

  if (!(await NativeFile.exists(destPath))) {
    await NativeFile.mkdir(destPath);
  }

  const items = await NativeFile.readDir(sourcePath);

  for (const item of items) {
    const isHtmlFile =
      item.name.endsWith('.html') || item.name.endsWith('.htm');
    const isNomediaFile = item.name.startsWith('.nomedia');

    if (!item.isDirectory && !isNomediaFile && isHtmlFile) {
      const sourceItemPath = `${sourcePath}/${item.name}`;
      const destItemPath = `${destPath}/${item.name}`;
      await NativeFile.copyFile(sourceItemPath, destItemPath);
    }
  }
};

/**
 * Creates a ZIP archive from a directory.
 */
const zipDirectory = async (
  sourceDirPath: string,
  zipFilePath: string,
): Promise<void> => {
  await NativeZipArchive.zip(sourceDirPath, zipFilePath);
};

/**
 * Restores downloaded chapters for a novel from backup.
 */
const restoreNovelDownloads = async (
  backupNovelPath: string,
  localNovelPath: string,
  novel: NovelInfo,
  backupNovelData: BackupNovel,
): Promise<void> => {
  if (!(await NativeFile.exists(backupNovelPath))) {
    return;
  }

  const backupChapterDirs = await NativeFile.readDir(backupNovelPath);

  for (const chapterDir of backupChapterDirs) {
    if (!chapterDir.isDirectory || chapterDir.name === 'cover.png') {
      continue;
    }

    const chapterId = parseInt(chapterDir.name, 10);
    const backupChapter = backupNovelData.chapters?.find(
      ch => ch.id === chapterId,
    );

    if (!backupChapter) {
      continue;
    }

    const currentChapter = await getFirstAsync<{ id: number }>([
      'SELECT * FROM Chapter WHERE novelId = ? AND path = ?',
      [novel.id, backupChapter.path],
    ]);

    if (!currentChapter) {
      continue;
    }

    const backupChapterPath = `${backupNovelPath}/${chapterDir.name}`;
    const localChapterPath = `${localNovelPath}/${currentChapter.id}`;
    const backupIndexFile = `${backupChapterPath}/index.html`;
    const chapterIndexFile = `${localChapterPath}/index.html`;

    if (await NativeFile.exists(backupIndexFile)) {
      if (!(await NativeFile.exists(chapterIndexFile))) {
        if (!(await NativeFile.exists(localChapterPath))) {
          await NativeFile.mkdir(localChapterPath);
        }

        await copyDirectoryRecursive(backupChapterPath, localChapterPath);

        await runAsync([
          [
            'UPDATE Chapter SET isDownloaded = 1 WHERE id = ?',
            [currentChapter.id],
          ],
        ]);
      }
    }
  }
};

/**
 * Validates backup file selection from document picker.
 */
const validateBackupFile = (backup: any): void => {
  if (!backup) {
    throw new Error('Document picker returned null');
  }

  if (backup.canceled === true) {
    throw new Error('Restore cancelled');
  }

  if (
    !backup.assets ||
    !Array.isArray(backup.assets) ||
    backup.assets.length === 0
  ) {
    throw new Error('No backup file selected');
  }

  const backupFile = backup.assets[0];

  if (!backupFile) {
    throw new Error('Backup file is null or undefined');
  }

  if (!backupFile.uri || typeof backupFile.uri !== 'string') {
    throw new Error('Invalid backup file - no valid URI');
  }
};

/**
 * Extracts backup ZIP file to specified directory.
 */
const extractBackupFile = async (
  backupUri: string,
  extractPath: string,
): Promise<void> => {
  if (await NativeFile.exists(extractPath)) {
    await NativeFile.unlink(extractPath);
  }

  await NativeFile.mkdir(extractPath);

  const sourceFilePath = backupUri.startsWith('file://')
    ? backupUri.replace('file://', '')
    : backupUri;

  try {
    await NativeZipArchive.unzip(sourceFilePath, extractPath);
  } catch (directError: unknown) {
    const tempZipPath = `${extractPath}_temp.zip`;

    try {
      if (await NativeFile.exists(tempZipPath)) {
        await NativeFile.unlink(tempZipPath);
      }

      await NativeFile.copyFile(backupUri, tempZipPath);

      if (!(await NativeFile.exists(tempZipPath))) {
        throw new Error('Failed to create temporary backup file');
      }

      await NativeZipArchive.unzip(tempZipPath, extractPath);

      if (await NativeFile.exists(tempZipPath)) {
        await NativeFile.unlink(tempZipPath);
      }
    } catch (copyError: unknown) {
      const message =
        copyError instanceof Error ? copyError.message : 'Unknown error';
      throw new Error(`Failed to extract backup: ${message}`);
    }
  }
};

/**
 * Generates summary text for restore results.
 */
const generateRestoreSummary = (
  results: LocalRestoreResult,
  backupFileName: string,
): string => {
  let summary = 'LOCAL BACKUP RESTORE COMPLETED:\n\n';

  summary += `ADDED (${results.added.length}):\n`;
  results.added.forEach(item => {
    summary += `- ${item.name}: ${item.reason}\n`;
  });

  summary += `\nOVERWRITTEN (${results.overwritten.length}):\n`;
  results.overwritten.forEach(item => {
    summary += `- ${item.name}: ${item.reason}\n`;
  });

  summary += `\nSKIPPED (${results.skipped.length}):\n`;
  results.skipped.forEach(item => {
    summary += `- ${item.name}: ${item.reason}\n`;
  });

  summary += `\nERRORED (${results.errored.length}):\n`;
  results.errored.forEach(item => {
    summary += `- ${item.name}: ${item.reason}\n`;
  });

  if (results.missingPlugins.length > 0) {
    summary += `\nMISSING PLUGINS (${results.missingPlugins.length}):\n`;
    results.missingPlugins.forEach(plugin => {
      summary += `- ${plugin}: Plugin not installed locally\n`;
    });
  }

  summary += `\nBackup File: ${backupFileName}`;
  return summary;
};

/**
 * Fixes cover paths for all novels that have relative paths.
 * Converts paths like "/Novels/plugin/id/cover.png" or "Novels/plugin/id/cover.png"
 * to full file:// URIs like "file:///storage/.../Novels/plugin/id/cover.png"
 */
const fixAllCoverPaths = async (): Promise<void> => {
  const novelsToFix = await getAllAsync<{ id: number; cover: string }>([
    `SELECT id, cover FROM Novel
     WHERE cover IS NOT NULL
     AND cover NOT LIKE 'file://%'
     AND (cover LIKE '/Novels/%' OR cover LIKE 'Novels/%')`,
  ]);

  if (novelsToFix.length === 0) {
    return;
  }

  const updates: [string, any[]][] = [];

  for (const novel of novelsToFix) {
    let fixedPath: string;

    if (novel.cover.startsWith('/Novels/')) {
      const relativePart = novel.cover.substring(8); // "plugin/id/cover.png"
      fixedPath = `file://${NOVEL_STORAGE}/${relativePart}`;
    } else if (novel.cover.startsWith('Novels/')) {
      const relativePart = novel.cover.substring(7); // "plugin/id/cover.png"
      fixedPath = `file://${NOVEL_STORAGE}/${relativePart}`;
    } else {
      continue;
    }

    updates.push([
      'UPDATE Novel SET cover = ? WHERE id = ?',
      [fixedPath, novel.id],
    ]);
  }

  if (updates.length > 0) {
    await runAsync(updates);
  }
};

/**
 * Restores novel cover from backup.
 */
const restoreNovelCover = async (
  backupNovelPath: string,
  localNovelPath: string,
  novelId: number,
): Promise<void> => {
  const backupCoverPath = `${backupNovelPath}/cover.png`;

  const coverExists = await NativeFile.exists(backupCoverPath);

  if (coverExists) {
    if (!(await NativeFile.exists(localNovelPath))) {
      await NativeFile.mkdir(localNovelPath);
    }

    const localCoverPath = `${localNovelPath}/cover.png`;
    await NativeFile.copyFile(backupCoverPath, localCoverPath);
    const novelCoverUri = `file://${localCoverPath}?${Date.now()}`;

    await runAsync([
      ['UPDATE Novel SET cover = ? WHERE id = ?', [novelCoverUri, novelId]],
    ]);
  }
};

/**
 * Restores a backup archive to the local database and storage.
 */
export const restoreBackup = async (
  includeDownloads: boolean = false,
  setMeta?: MetaSetter,
  preselectedBackupFile?: any,
): Promise<void> => {
  const result: LocalRestoreResult = {
    added: [],
    skipped: [],
    errored: [],
    overwritten: [],
    missingPlugins: [],
  };

  try {
    updateProgress(setMeta, {
      isRunning: true,
      progress: 0,
      progressText: 'Selecting backup file...',
    });

    const datetime = dayjs().format('YYYY-MM-DD_HH_mm_ss_SSS');
    const uniqueRestoreDir = `${CACHE_DIR_PATH}_restore_${datetime}`;

    const backup = preselectedBackupFile
      ? { canceled: false, assets: [preselectedBackupFile] }
      : await DocumentPicker.getDocumentAsync({
          type: 'application/zip',
          copyToCacheDirectory: true,
        });

    validateBackupFile(backup);

    const backupFile = backup.assets[0];

    updateProgress(setMeta, {
      progress: 0.1,
      progressText: 'Extracting backup...',
    });

    await extractBackupFile(backupFile.uri, uniqueRestoreDir);

    updateProgress(setMeta, {
      progress: 0.3,
      progressText: getString('backupScreen.restoringData'),
    });

    await restoreDataMerge(uniqueRestoreDir, result, setMeta);

    updateProgress(setMeta, {
      progress: 0.5,
      progressText: 'Fixing cover paths...',
    });

    await fixAllCoverPaths();

    updateProgress(setMeta, {
      progress: 0.6,
      progressText: includeDownloads
        ? 'Restoring downloaded files...'
        : 'Restoring covers...',
    });

    await restoreNovelFiles(uniqueRestoreDir, result, includeDownloads);

    if (await NativeFile.exists(uniqueRestoreDir)) {
      await NativeFile.unlink(uniqueRestoreDir);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    updateProgress(setMeta, {
      progress: 0.95,
      progressText: 'Preparing summary...',
    });

    const summaryText = generateRestoreSummary(result, backupFile.name);
    await Clipboard.setStringAsync(summaryText);

    const successMessage = buildSuccessMessage(result);

    updateProgress(setMeta, {
      isRunning: false,
      progress: 1,
      progressText: successMessage,
    });

    showToast(successMessage);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (!result.errored.find(e => e.name === 'Restore Process')) {
      result.errored.push({
        name: 'Restore Process',
        reason: message,
      });
    }

    const errorSummary = `LOCAL BACKUP RESTORE FAILED:\nError: ${message}\nPartial Results:\nAdded: ${result.added.length}, Overwritten: ${result.overwritten.length}, Skipped: ${result.skipped.length}, Errored: ${result.errored.length}`;
    await Clipboard.setStringAsync(errorSummary);

    updateProgress(setMeta, {
      isRunning: false,
      progress: undefined,
      progressText: `Restore failed: ${message}`,
    });

    showToast(getString('backupScreen.failed'));
  }
};

/**
 * Builds success message from restore results.
 */
const buildSuccessMessage = (result: LocalRestoreResult): string => {
  const parts = [
    `${result.added.length} added`,
    `${result.overwritten.length} overwritten`,
    `${result.skipped.length} skipped`,
  ];

  if (result.errored.length > 0) {
    parts.push(`${result.errored.length} errored`);
  }

  if (result.missingPlugins.length > 0) {
    parts.push(`${result.missingPlugins.length} missing plugins`);
  }

  return `Restore completed: ${parts.join(', ')}. ${getString(
    'common.copiedToClipboard',
    {
      name: 'Details',
    },
  )}`;
};

/**
 * Restores novel files and downloads from backup.
 * Iterates through backup JSON files (which contain pluginId and path) to match novels
 * using the combined key instead of old database IDs.
 */
const restoreNovelFiles = async (
  extractPath: string,
  result: LocalRestoreResult,
  restoreDownloads: boolean,
): Promise<void> => {
  const backupDataPath = `${extractPath}/${BackupEntryName.NOVEL_AND_CHAPTERS}`;

  if (!(await NativeFile.exists(backupDataPath))) {
    return;
  }

  const backupNovelsPath = `${extractPath}/novels`;
  const hasNovelFiles = await NativeFile.exists(backupNovelsPath);

  // Get all current novels to match against
  const currentNovels = await getAllNovels();
  const currentNovelMap = new Map(
    currentNovels.map(novel => [`${novel.pluginId}:${novel.path}`, novel]),
  );

  // Iterate through backup JSON files to get pluginId and path
  const backupFiles = await NativeFile.readDir(backupDataPath);

  for (const backupFile of backupFiles) {
    if (backupFile.isDirectory || !backupFile.name.endsWith('.json')) {
      continue;
    }

    try {
      const backupNovelData = JSON.parse(
        await NativeFile.readFile(backupFile.path),
      ) as BackupNovel;

      if (!backupNovelData.pluginId || !backupNovelData.path) {
        continue;
      }

      const plugin = getPlugin(backupNovelData.pluginId);
      if (!plugin) {
        if (!result.missingPlugins.includes(backupNovelData.pluginId)) {
          result.missingPlugins.push(backupNovelData.pluginId);
        }
        continue;
      }

      const novelKey = `${backupNovelData.pluginId}:${backupNovelData.path}`;
      const currentNovel = currentNovelMap.get(novelKey);

      if (!currentNovel) {
        continue;
      }

      const oldNovelId = backupFile.name.replace('.json', '');

      const localPluginPath = `${NOVEL_STORAGE}/${backupNovelData.pluginId}`;
      const localNovelPath = `${localPluginPath}/${currentNovel.id}`;

      if (!(await NativeFile.exists(localPluginPath))) {
        await NativeFile.mkdir(localPluginPath);
      }

      if (!(await NativeFile.exists(localNovelPath))) {
        await NativeFile.mkdir(localNovelPath);
      }

      if (hasNovelFiles) {
        const backupNovelPath = `${backupNovelsPath}/${backupNovelData.pluginId}/${oldNovelId}`;

        if (await NativeFile.exists(backupNovelPath)) {
          await restoreNovelCover(
            backupNovelPath,
            localNovelPath,
            currentNovel.id,
          );

          if (restoreDownloads) {
            await restoreNovelDownloads(
              backupNovelPath,
              localNovelPath,
              currentNovel,
              backupNovelData,
            );
          }
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      result.errored.push({
        name: `File restore for ${backupFile.name}`,
        reason: `Failed to restore files: ${message}`,
      });
    }
  }
};
