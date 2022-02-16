import {useAppDispatch, useDownloadQueue} from '../redux/hooks';

import {
  addToDownloadQueue,
  removeFromDownloadQueue,
} from '../redux/downloads/downloadsSlice';

import {ChapterItem} from '../database/types';
import {
  deleteChapterFromDb,
  fetchAndInsertChapterInDb,
} from '../database/queries/DownloadQueries';
import {showToast} from './showToast';
import {updateChapterDownloaded} from '../redux/novel/novelSlice';

import BackgroundService from 'react-native-background-actions';
import {sleep} from '../utils/sleep';

const useDownloader = () => {
  const dispatch = useAppDispatch();

  const downloadQueue = useDownloadQueue();

  const downloadChapter = async (
    sourceId: number,
    novelUrl: string,
    chapter: ChapterItem,
  ) => {
    try {
      if (chapter.downloaded === 0) {
        dispatch(addToDownloadQueue([chapter]));

        await fetchAndInsertChapterInDb(
          sourceId,
          novelUrl,
          chapter.chapterId,
          chapter.chapterUrl,
        );

        dispatch(removeFromDownloadQueue(chapter.chapterId));
      } else {
        deleteChapterFromDb(chapter.chapterId);
      }

      showToast(
        `${chapter.chapterName} ${
          chapter.downloaded === 0 ? 'downloaded' : 'deleted'
        }.`,
      );
      dispatch(updateChapterDownloaded(chapter.chapterId));
    } catch (error) {
      showToast(error);
    }
  };

  const downloadChapters = async (
    sourceId: number,
    novelUrl: string,
    chapters: ChapterItem[],
  ) => {
    let chaptersToDownload = chapters.filter(
      (chapter: ChapterItem) =>
        !downloadQueue.some(
          (item: ChapterItem) => item.chapterId === chapter.chapterId,
        ),
    );

    chaptersToDownload = chaptersToDownload.filter(
      item => Boolean(item.downloaded) === false,
    );

    const noOfChapters = chaptersToDownload.length;

    if (noOfChapters > 0) {
      dispatch(addToDownloadQueue(chaptersToDownload));

      const firstChapter = chaptersToDownload[0];

      const options = {
        taskName: 'Download Chapters',
        taskTitle: firstChapter.chapterName,
        taskDesc: `(0/${noOfChapters})`,
        taskIcon: {
          name: 'notification_icon',
          type: 'drawable',
        },
        color: '#00ADB5',
        linkingURI: 'lnreader://downloads/redirect',
        parameters: {
          delay: 1000,
        },
        progressBar: {
          max: noOfChapters,
          value: 0,
        },
      };

      const veryIntensiveTask = async (taskDataArguments: any) => {
        const {delay} = taskDataArguments;

        await new Promise<void>(async resolve => {
          for (
            let i = 0;
            BackgroundService.isRunning() && i < noOfChapters;
            i++
          ) {
            try {
              const currentChapter = chaptersToDownload[i];

              await fetchAndInsertChapterInDb(
                sourceId,
                novelUrl,
                currentChapter.chapterId,
                currentChapter.chapterUrl,
              );

              dispatch(removeFromDownloadQueue(currentChapter.chapterId));
              dispatch(updateChapterDownloaded(currentChapter.chapterId));

              await BackgroundService.updateNotification({
                taskTitle: currentChapter.chapterName,
                taskDesc: i + 1 + '/' + noOfChapters,
                progressBar: {max: noOfChapters, value: i + 1},
              });

              if (i + 1 === noOfChapters) {
                resolve();
              }
              await sleep(delay);
            } catch (err) {
              showToast(`${chapters[i].chapterName}: ${err.message}`);

              continue;
            }
          }
        });
      };

      await BackgroundService.start(veryIntensiveTask, options);
    }
  };

  return {downloadChapter, downloadChapters};
};

export default useDownloader;
