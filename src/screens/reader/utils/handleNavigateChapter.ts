import { useNovel } from '@hooks/reduxHooks';

interface openChapterProps {
  novel: {
    novelUrl: string;
    sourceId: string;
    novelName: string;
  };
  chapter: {
    chapterId: number;
    chapterUrl: string;
    novelId: string;
    chapterName: string;
    bookmark: boolean;
  };
  chapters: [
    {
      chapterId: number;
      chapterName: string;
      chapterUrl: string;
    },
  ];
}
interface selectFewerProps {
  chapterId: number;
  chapterName: string;
  chapterUrl: string;
}
const selectFewerProps = (obj: selectFewerProps) => {
  const { chapterId, chapterName, chapterUrl } = obj;
  return { chapterId, chapterName, chapterUrl };
};
export function DopenChapter(
  novel: openChapterProps['novel'],
  chapter: openChapterProps['chapter'],
) {
  const { chapters } = useNovel();
  return {
    currentChapter: {
      novelUrl: novel.novelUrl,
      sourceId: novel.sourceId,
      novelName: novel.novelName,
      chapterId: chapter.chapterId,
      chapterUrl: chapter.chapterUrl,
      novelId: chapter.novelId,
      chapterName: chapter.chapterName,
      bookmark: chapter.bookmark,
    },
    chapters: chapters.map(selectFewerProps),
  };
}

export function openChapter(
  novel: openChapterProps['novel'],
  chapter: openChapterProps['chapter'],
) {
  return {
    novelUrl: novel.novelUrl,
    sourceId: novel.sourceId,
    novelName: novel.novelName,
    chapterId: chapter.chapterId,
    chapterUrl: chapter.chapterUrl,
    novelId: chapter.novelId,
    chapterName: chapter.chapterName,
    bookmark: chapter.bookmark,
  };
}
