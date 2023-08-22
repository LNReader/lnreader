export type NovelRouteParams = {
  novelUrl: string;
  sourceId: number;
  novelName: string;
};

export type ChapterRouteParams = {
  chapterId: number;
  chapterUrl: string;
  novelId: number;
  chapterName: string;
  bookmark: number;
};

export type GetChapterScreenRouteParamsProps = NovelRouteParams &
  ChapterRouteParams;

export function getChapterScreenRouteParams(
  novel: NovelRouteParams,
  chapter: ChapterRouteParams,
): GetChapterScreenRouteParamsProps {
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
export interface NovelScreenRouteParams {
  sourceId: number;
  novelId?: number;
  novelUrl: string;
  novelName: string;
  novelCover?: string;
}

export function getNovelScreenRouteParams(
  novel: NovelScreenRouteParams,
): NovelScreenRouteParams {
  return {
    sourceId: novel.sourceId,
    novelId: novel?.novelId,
    novelUrl: novel.novelUrl,
    novelName: novel.novelName,
    novelCover: novel?.novelCover,
  };
}
