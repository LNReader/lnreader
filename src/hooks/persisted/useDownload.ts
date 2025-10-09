import { ChapterInfo, NovelInfo } from '@database/types';
import { useQueue } from '@providers/Providers';
import ServiceManager from '@services/ServiceManager';
import { useCallback, useMemo } from 'react';

export const DOWNLOAD_QUEUE = 'DOWNLOAD';
export const CHAPTER_DOWNLOADING = 'CHAPTER_DOWNLOADING';

export default function useDownload() {
  const { downloadQueue } = useQueue();

  const downloadChapter = useCallback(
    (novel: NovelInfo, chapter: ChapterInfo) =>
      ServiceManager.manager.addTask({
        name: 'DOWNLOAD_CHAPTER',
        data: {
          chapterId: chapter.id,
          novelName: novel.name,
          novelId: novel.id,
          chapterName: chapter.name,
        },
      }),
    [],
  );
  const downloadChapters = useCallback(
    (novel: NovelInfo, chapters: ChapterInfo[]) =>
      ServiceManager.manager.addTask(
        chapters.map(chapter => ({
          name: 'DOWNLOAD_CHAPTER',
          data: {
            chapterId: chapter.id,
            novelName: novel.name,
            novelId: novel.id,
            chapterName: chapter.name,
          },
        })),
      ),
    [],
  );

  const hookContent = useMemo(
    () => ({
      downloadQueue,
      downloadChapter,
      downloadChapters,
      resumeDowndload: () => ServiceManager.manager.resume(),
      pauseDownload: () => ServiceManager.manager.pause(),
      cancelDownload: () =>
        ServiceManager.manager.removeTasksByName('DOWNLOAD_CHAPTER'),
    }),
    [downloadChapter, downloadChapters, downloadQueue],
  );

  return hookContent;
}
