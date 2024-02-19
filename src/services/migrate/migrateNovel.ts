import * as SQLite from 'expo-sqlite';
import * as Notifications from 'expo-notifications';
import BackgroundService from 'react-native-background-actions';

import { NovelInfo, ChapterInfo } from '@database/types';
import {
  getNovel,
  insertNovelAndChapters,
} from '@database/queries/NovelQueries';
import { getNovelChapters } from '@database/queries/ChapterQueries';
import { downloadChapter } from '@database/queries/ChapterQueries';

import { fetchNovel } from '@services/plugin/fetch';
import { parseChapterNumber } from '@utils/parseChapterNumber';

import { noop } from 'lodash-es';
import { txnErrorCallback } from '@database/utils/helpers';
import { showToast } from '@utils/showToast';
import { MMKVStorage, getMMKVObject, setMMKVObject } from '@utils/mmkv/mmkv';
import {
  LAST_READ_PREFIX,
  NOVEL_SETTINSG_PREFIX,
} from '@hooks/persisted/useNovel';
import { BACKGROUND_ACTION, BackgoundAction } from '@services/constants';
import { getString } from '@strings/translations';

const db = SQLite.openDatabase('lnreader.db');

const migrateNovelMetaDataQuery =
  'UPDATE Novel SET cover = ?, summary = ?, author = ?, artist = ?, status = ?, genres = ?, inLibrary = 1  WHERE id = ?';
const migrateChapterQuery =
  'UPDATE Chapter SET bookmark = ?, unread = ?, readTime = ?, progress = ? WHERE id = ?';

const sleep = (time: number): any =>
  new Promise(resolve => setTimeout(() => resolve(null), time));

const sortChaptersByNumber = (novelName: string, chapters: ChapterInfo[]) => {
  for (let i = 0; i < chapters.length; ++i) {
    if (!chapters[i].chapterNumber) {
      chapters[i].chapterNumber = parseChapterNumber(
        novelName,
        chapters[i].name,
      );
    }
  }
  return chapters.sort((a, b) => {
    if (a.chapterNumber && b.chapterNumber) {
      return a.chapterNumber - b.chapterNumber;
    }
    return 0;
  });
};

export const migrateNovel = async (
  pluginId: string,
  fromNovel: NovelInfo,
  toNovelPath: string,
) => {
  const currentAction = MMKVStorage.getString(BACKGROUND_ACTION);
  if (currentAction) {
    showToast(getString('browseScreen.migration.anotherServiceIsRunning'));
    return;
  }
  try {
    let fromChapters = await getNovelChapters(fromNovel.id);
    let toNovel = await getNovel(toNovelPath, pluginId);
    let toChapters: ChapterInfo[];
    if (toNovel) {
      toChapters = await getNovelChapters(toNovel.id);
    } else {
      const fetchedNovel = await fetchNovel(pluginId, toNovelPath).catch(e => {
        throw e;
      });
      await insertNovelAndChapters(pluginId, fetchedNovel);
      toNovel = await getNovel(toNovelPath, pluginId);
      if (!toNovel) {
        return;
      }
      toChapters = await getNovelChapters(toNovel.id);
    }

    const options = {
      taskName: 'Migration',
      taskTitle: getString('browseScreen.migration.migratingToNewSource', {
        name: fromNovel.name,
      }),
      taskDesc: '(0/' + fromChapters.length + ')',
      taskIcon: {
        name: 'notification_icon',
        type: 'drawable',
      },
      color: '#00adb5',
      parameters: {
        delay: 1000,
      },
      progressBar: {
        max: fromChapters.length,
        value: 0,
      },
    };

    const veryIntensiveTask = async (taskData: any) => {
      try {
        MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.MIGRATE);
        db.transaction(tx => {
          tx.executeSql(
            migrateNovelMetaDataQuery,
            [
              fromNovel.cover || toNovel.cover || '',
              fromNovel.summary || toNovel.summary || '',
              fromNovel.author || toNovel.author || '',
              fromNovel.artist || toNovel.artist || '',
              fromNovel.status || toNovel.status || '',
              fromNovel.genres || toNovel.genres || '',
              toNovel.id,
            ],
            noop,
            txnErrorCallback,
          );
          tx.executeSql(
            'UPDATE OR IGNORE NovelCategory SET novelId = ? WHERE novelId = ?',
            [toNovel.id, fromNovel.id],
            noop,
            txnErrorCallback,
          );
          tx.executeSql(
            'DELETE FROM Novel WHERE id = ?',
            [fromNovel.id],
            noop,
            txnErrorCallback,
          );
        });

        setMMKVObject(
          `${NOVEL_SETTINSG_PREFIX}_${toNovel.pluginId}_${toNovel.path}`,
          getMMKVObject(
            `${NOVEL_SETTINSG_PREFIX}_${fromNovel.pluginId}_${fromNovel.path}`,
          ),
        );

        const lastRead = getMMKVObject<NovelInfo>(
          `${LAST_READ_PREFIX}_${fromNovel.pluginId}_${fromNovel.path}`,
        );

        const setLastRead = (chapter: ChapterInfo) => {
          setMMKVObject(
            `${LAST_READ_PREFIX}_${toNovel.pluginId}_${toNovel.path}`,
            chapter,
          );
        };

        fromChapters = sortChaptersByNumber(fromNovel.name, fromChapters);
        toChapters = sortChaptersByNumber(toNovel.name, toChapters);

        let fromPointer = 0,
          toPointer = 0;
        while (
          fromPointer < fromChapters.length &&
          toPointer < toChapters.length
        ) {
          const fromChapter = fromChapters[fromPointer];
          const toChapter = toChapters[toPointer];
          if (fromChapter.chapterNumber && toChapter.chapterNumber) {
            if (fromChapter.chapterNumber < toChapter.chapterNumber) {
              ++fromPointer;
              continue;
            }
            if (fromChapter.chapterNumber > toChapter.chapterNumber) {
              ++toPointer;
              continue;
            }
          } else {
            ++fromPointer;
            ++toPointer;
            continue;
          }

          db.transaction(tx =>
            tx.executeSql(migrateChapterQuery, [
              Number(fromChapter.bookmark),
              Number(fromChapter.unread),
              fromChapter.readTime,
              fromChapter.progress,
              toChapter.id,
            ]),
          );

          if (fromChapter.isDownloaded) {
            await downloadChapter(
              pluginId,
              toNovel.id,
              toChapter.id,
              toChapter.path,
            );
            await sleep(taskData.delay || 1000);
          }

          if (lastRead && fromChapter.id === lastRead.id) {
            setLastRead(toChapter);
          }

          await BackgroundService.updateNotification({
            taskDesc: '(' + (fromPointer + 1) + '/' + fromChapters.length + ')',
            progressBar: { max: fromChapters.length, value: fromPointer + 1 },
          });

          ++fromPointer;
          ++toPointer;

          if (
            fromChapters.length === fromPointer ||
            toChapters.length === toPointer
          ) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: getString('browseScreen.migration.novelMigrated'),
                body: fromNovel.name,
              },
              trigger: null,
            });
          }
        }
      } finally {
        MMKVStorage.delete(BACKGROUND_ACTION);
        BackgroundService.stop();
      }
    };
    await BackgroundService.start(veryIntensiveTask, options);
  } catch (error: any) {
    Notifications.scheduleNotificationAsync({
      content: {
        title: getString('browseScreen.migration.migrationError'),
        body: error.message,
      },
      trigger: null,
    });
    showToast(error.message);
  }
};
