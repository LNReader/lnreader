import * as SQLite from 'expo-sqlite';
import * as Notifications from 'expo-notifications';
import BackgroundService from 'react-native-background-actions';
import { store } from '@redux/store';

import { Novel, Chapter, ExtendedChapter } from '@database/types';
import {
  getNovel,
  insertNovelandChapters,
} from '@database/queries/NovelQueries';
import { getExtendedChaptersByNovel } from '@database/queries/extendedChaptersQueries';
import { downloadChapter } from '@database/queries/ChapterQueries';

import { fetchNovel } from '@services/plugin/fetch';
import { parseChapterNumber } from '@utils/parseChapterNumber';

import { noop } from 'lodash-es';
import { txnErrorCallback } from '@database/utils/helpers';
import { showToast } from '@hooks/showToast';

const db = SQLite.openDatabase('lnreader.db');

type ReduxNovelSettings = Record<
  number,
  {
    sort: string;
    filter: string;
    showChapterTitles: boolean;
    lastRead: Chapter;
    position: Record<
      number,
      {
        offsetY: number;
        percentage: number;
      }
    >;
  }
>;
const migrateNovelMetaDataQuery =
  'UPDATE Novel SET cover = ?, summary = ?, author = ?, artist = ?, status = ?, genres = ?, inLibrary = 1  WHERE id = ?';
const migrateChapterQuery =
  'UPDATE Chapter SET bookmark = ?, unread = ?, readTime = ? WHERE id = ?';

const sleep = (time: number): any =>
  new Promise(resolve => setTimeout(() => resolve(null), time));

const sortChaptersByNumber = (
  novelName: string,
  chapters: ExtendedChapter[],
) => {
  for (let i = 0; i < chapters.length; ++i) {
    chapters[i].chapterNumber = parseChapterNumber(novelName, chapters[i].name);
  }
  return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
};

export const migrateNovel = async (
  pluginId: string,
  fromNovel: Novel,
  toNovelUrl: string,
) => {
  try {
    let fromChapters = await getExtendedChaptersByNovel(fromNovel);
    let toNovel = await getNovel(toNovelUrl);
    let toChapters: ExtendedChapter[];
    if (toNovel) {
      toChapters = await getExtendedChaptersByNovel(toNovel);
    } else {
      const fetchedNovel = await fetchNovel(pluginId, toNovelUrl);
      await insertNovelandChapters(pluginId, fetchedNovel);
      toNovel = await getNovel(toNovelUrl);
      toChapters = await getExtendedChaptersByNovel(toNovel);
    }

    const options = {
      taskName: 'Migration',
      taskTitle: `Migrating ${fromNovel.name} to new source`,
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
      await new Promise(async resolve => {
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

        const state = store.getState();
        const novelSettings = state.preferenceReducer
          .novelSettings as ReduxNovelSettings;
        const { sort, filter, showChapterTitles, lastRead, position } =
          novelSettings[fromNovel.id];
        fromChapters = sortChaptersByNumber(fromNovel.name, fromChapters);
        toChapters = sortChaptersByNumber(toNovel.name, toChapters);
        novelSettings[toNovel.id] = {
          sort: sort,
          filter: filter,
          showChapterTitles: showChapterTitles,
          lastRead: toChapters[0],
          position: {},
        };
        delete novelSettings[fromNovel.id];

        let fromPointer = 0,
          toPointer = 0;
        while (
          fromPointer < fromChapters.length &&
          toPointer < toChapters.length
        ) {
          const fromChapter = fromChapters[fromPointer];
          const toChapter = toChapters[toPointer];

          if (fromChapter.chapterNumber < toChapter.chapterNumber) {
            ++fromPointer;
            continue;
          }
          if (fromChapter.chapterNumber > toChapter.chapterNumber) {
            ++toPointer;
            continue;
          }

          if (position && position[fromChapter.id]) {
            novelSettings[toNovel.id].position[toChapter.id] =
              position[fromChapter.id];
          }

          db.transaction(tx =>
            tx.executeSql(migrateChapterQuery, [
              fromChapter.bookmark,
              fromChapter.unread,
              fromChapter.readTime,
              toChapter.id,
            ]),
          );

          if (fromChapter.isDownloaded) {
            await downloadChapter(toChapter);
            await sleep(taskData.delay || 1000);
          }

          if (lastRead && fromChapter.id === lastRead.id) {
            novelSettings[toNovel.id].lastRead = lastRead;
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
                title: 'Novel Migrated',
                body: fromNovel.name,
              },
              trigger: null,
            });
            resolve(null);
          }
        }
      });
    };

    await BackgroundService.start(veryIntensiveTask, options);
  } catch (error: any) {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Migration error',
        body: error.message,
      },
      trigger: null,
    });
    showToast(error.message);
  }
};