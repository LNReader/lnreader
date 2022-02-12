import {useState} from 'react';

import * as Notifications from 'expo-notifications';
import BackgroundService from 'react-native-background-actions';

import {updateChapters} from '../../../database/queries/ChapterQueries';
import {updateNovelInfo} from '../../../database/queries/NovelQueries';

import {useAppDispatch, useUpdateSettings} from '../../../redux/hooks';

import {showToast} from '../../../hooks/showToast';
import {sleep} from '../../../utils/sleep';

import {LibraryNovelInfo, NovelInfo} from '../../../database/types';

import useLibrary from '../../LibraryScreen/hooks/useLibrary';
import {sourceManager} from '../../../sources/sourceManager';
import {getNovel} from '../../../redux/novel/novelSlice';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

const useLibraryUpdates = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const dispatch = useAppDispatch();

  const {novels} = useLibrary();

  const {onlyUpdateOngoingNovels, updateNovelMetadata} = useUpdateSettings();

  const updateNovel = async (novel: NovelInfo) => {
    setIsUpdating(true);
    setIsUpdating(false);
    const source = sourceManager(novel.sourceId);
    const sourceNovel = await source.parseNovelAndChapters(novel.novelUrl);

    if (updateNovelMetadata) {
      await updateNovelInfo(sourceNovel);
    }

    if (sourceNovel.chapters) {
      await updateChapters(novel.novelId, sourceNovel.chapters);
    }

    dispatch(
      getNovel({
        novelUrl: novel.novelUrl,
        sourceId: novel.sourceId,
      }),
    );
  };

  const updateLibrary = async () => {
    setIsUpdating(true);

    let updateQueue: LibraryNovelInfo[] = novels;

    if (onlyUpdateOngoingNovels) {
      updateQueue = updateQueue.filter(novel => novel.status !== 'Completed');
    }

    const updateNotificationOptions = {
      taskName: 'Library Update',
      taskTitle: 'Updating library',
      taskDesc: `(0/${updateQueue.length})`,
      taskIcon: {
        name: 'notification_icon',
        type: 'drawable',
      },
      color: '#00ADB5',
      parameters: {
        delay: 1000,
      },
      linkingURI: 'lnreader://updates',
      progressBar: {
        max: updateQueue.length,
        value: 0,
      },
    };

    const updateLibraryBackgroundAction = async (taskData: any) =>
      await new Promise<void>(async resolve => {
        setIsUpdating(false);
        for (
          let i = 0;
          BackgroundService.isRunning() && i < updateQueue.length;
          i++
        ) {
          try {
            const novel = updateQueue[i];

            const source = sourceManager(novel.sourceId);
            const sourceNovel = await source.parseNovelAndChapters(
              novel.novelUrl,
            );

            if (updateNovelMetadata) {
              await updateNovelInfo(sourceNovel);
            }

            if (sourceNovel.chapters) {
              await updateChapters(novel.novelId, sourceNovel.chapters);
            }

            await BackgroundService.updateNotification({
              taskTitle: novel.novelName,
              taskDesc: `(${i + 1}/${updateQueue.length})`,
              progressBar: {
                max: updateQueue.length,
                value: i + 1,
              },
            });

            if (updateQueue.length === i + 1) {
              resolve();

              Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Library Updated',
                  body: `${updateQueue.length} novels updated`,
                },
                trigger: null,
              });
            }

            const nextNovelIndex = i + 1;

            if (
              nextNovelIndex in updateQueue &&
              updateQueue[nextNovelIndex].sourceId === updateQueue[i].sourceId
            ) {
              await sleep(taskData.delay);
            }
          } catch (err) {
            showToast(`${updateQueue[i].novelName}: ${err.message}`);

            continue;
          }
        }
      });

    if (updateQueue.length > 0) {
      await BackgroundService.start(
        updateLibraryBackgroundAction,
        updateNotificationOptions,
      );
    }
  };

  return {isUpdating, updateLibrary, updateNovel};
};

export default useLibraryUpdates;
