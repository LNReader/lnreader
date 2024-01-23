import { ChapterInfo, NovelInfo } from '@database/types';
import { BACKGROUND_ACTION, BackgoundAction } from '@services/constants';
import { MMKVStorage, getMMKVObject, setMMKVObject } from '@utils/mmkv/mmkv';
import { showToast } from '@utils/showToast';
import BackgroundService from 'react-native-background-actions';
import { useMMKVObject } from 'react-native-mmkv';
import * as Notifications from 'expo-notifications';
import { downloadChapter } from '@database/queries/ChapterQueries';
import { sleep } from '@utils/sleep';

export const DOWNLOAD_QUEUE = 'DOWNLOAD';
export const CHAPTER_DOWNLOADING = 'CHAPTER_DOWNLOADING';

interface DownloadData {
  novel: NovelInfo;
  chapter: ChapterInfo;
}

interface TaskData {
  delay: number;
}

const downloadChapterAction = async (taskData?: TaskData) => {
  try {
    MMKVStorage.set(BACKGROUND_ACTION, BackgoundAction.DOWNLOAD_CHAPTER);
    let queue = getMMKVObject<DownloadData[]>(DOWNLOAD_QUEUE) || [];
    while (queue.length > 0) {
      const { novel, chapter } = queue[0];
      await BackgroundService.updateNotification({
        taskTitle: `Downloading: ${novel.name}`,
        taskDesc: `Chapter: ${chapter.name}`,
      });
      await downloadChapter(
        novel.pluginId,
        novel.id,
        chapter.id,
        chapter.url,
      ).catch((error: Error) =>
        Notifications.scheduleNotificationAsync({
          content: {
            title: chapter.name,
            body: `Download failed: ${error.message}`,
          },
          trigger: null,
        }),
      );
      // get the newtest queue;
      queue = getMMKVObject<DownloadData[]>(DOWNLOAD_QUEUE) || [];
      setMMKVObject(DOWNLOAD_QUEUE, queue.slice(1));
      queue = getMMKVObject<DownloadData[]>(DOWNLOAD_QUEUE) || [];
      if (taskData) {
        await sleep(taskData?.delay);
      }
    }
  } finally {
    MMKVStorage.delete(BACKGROUND_ACTION);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Downloader',
        body: 'Download completed',
      },
      trigger: null,
    });
    BackgroundService.stop();
  }
};

export default function useDownload() {
  const [queue = [], setQueue] = useMMKVObject<DownloadData[]>(DOWNLOAD_QUEUE);

  const downloadChapter = (novel: NovelInfo, chapter: ChapterInfo) => {
    setQueue([...queue, { novel, chapter }]);
    resumeDowndload();
  };

  const downloadChapters = (novel: NovelInfo, chapters: ChapterInfo[]) => {
    setQueue([
      ...queue,
      ...chapters.map(chapter => {
        return { novel, chapter };
      }),
    ]);
    resumeDowndload();
  };

  const resumeDowndload = () => {
    const currentAction = MMKVStorage.getString(BACKGROUND_ACTION) as
      | BackgoundAction
      | undefined;
    if (!currentAction || currentAction === BackgoundAction.DOWNLOAD_CHAPTER) {
      if (!BackgroundService.isRunning()) {
        BackgroundService.start(downloadChapterAction, {
          taskName: 'Download chapters',
          taskTitle: 'Downloading',
          taskDesc: 'Preparing',
          taskIcon: { name: 'notification_icon', type: 'drawable' },
          color: '#00adb5',
          parameters: { delay: 1000 },
          linkingURI: 'lnreader://updates',
        });
      }
    } else {
      showToast('Another service is running. Queued chapters');
    }
  };

  const pauseDownload = () => {
    BackgroundService.stop().finally(() => {
      MMKVStorage.delete(BACKGROUND_ACTION);
    });
  };

  const cancelDownload = () => {
    BackgroundService.stop().finally(() => {
      setQueue([]);
      MMKVStorage.delete(BACKGROUND_ACTION);
    });
  };

  return {
    queue,
    resumeDowndload,
    downloadChapter,
    downloadChapters,
    pauseDownload,
    cancelDownload,
  };
}
