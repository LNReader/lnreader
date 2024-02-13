interface oCProps {
  novel: {
    path: string;
    pluginId: string;
    name: string;
  };
  chapter: {
    id: number;
    path: string;
    novelId: number;
    name: string;
    bookmark: number;
    page: string;
  };
}
export type openChapterChapterTypes = oCProps['chapter'];
export type openChapterNovelTypes = oCProps['novel'];

export function openChapter(
  novel: openChapterNovelTypes,
  chapter: openChapterChapterTypes,
) {
  return {
    ...novel,
    ...chapter,
  };
}
export interface openNovelProps {
  pluginId: string;
  id?: number;
  path: string;
  name: string;
  cover?: string;
}
export function openNovel(novel: openNovelProps): openNovelProps {
  return {
    ...novel,
  };
}
