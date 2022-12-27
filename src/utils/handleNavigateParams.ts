import { ChapterItem, NovelInfo } from '@database/types';

export type openChapterFunctionTypes = NovelInfo & ChapterItem;

export function openChapter(
  novel: NovelInfo,
  chapter: ChapterItem,
): openChapterFunctionTypes {
  return {
    novelUrl: novel.novelUrl,
    sourceId: novel.sourceId,
    novelName: novel.novelName,
    source: novel?.source,
    sourceUrl: novel?.sourceUrl,
    followed: novel?.followed,
    chapterId: chapter.chapterId,
    chapterUrl: chapter.chapterUrl,
    novelId: chapter.novelId,
    chapterPrefix: chapter.chapterPrefix,
    chapterName: chapter.chapterName,
    bookmark: chapter.bookmark,
    read: chapter?.read,
    downloaded: chapter?.downloaded,
  };
}
export interface openNovelProps {
  sourceId: number;
  novelId?: number;
  novelUrl: string;
  novelName: string;
  novelCover?: string;
}
export function openNovel(novel: openNovelProps): openNovelProps {
  return {
    sourceId: novel.sourceId,
    novelId: novel?.novelId,
    novelUrl: novel.novelUrl,
    novelName: novel.novelName,
    novelCover: novel?.novelCover,
  };
}
