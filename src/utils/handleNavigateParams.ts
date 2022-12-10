interface oCProps {
  novel: {
    novelUrl: string;
    sourceId: number;
    novelName: string;
  };
  chapter: {
    chapterId: number;
    chapterUrl: string;
    novelId: number;
    chapterName: string;
    bookmark: number;
  };
}
export type openChapterChapterTypes = oCProps['chapter'];
export type openChapterNovelTypes = oCProps['novel'];
export type openChapterFunctionTypes = oCProps['novel'] & oCProps['chapter'];

export function openChapter(
  novel: openChapterNovelTypes,
  chapter: openChapterChapterTypes,
): openChapterFunctionTypes {
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
