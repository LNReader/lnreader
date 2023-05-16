import { NovelItem, ChapterItem } from '@plugins/types';

export interface Novel extends NovelItem {
  id: number;
  pluginId: string;
  inLibrary: number;
}

export interface ExtendedNovel extends Novel {
  chaptersUnread: number;
  chaptersDownloaded: number;
}

export interface Category {
  id: number;
  name: string;
  sort: number;
}

export interface ExtendedCategory extends Category {
  novels: ExtendedNovel[];
}

export interface Chapter extends ChapterItem {
  id: number;
  novelId: number;
  readTime: string;
  bookmark: number;
  unread: number;
  isDownloaded: number;
  updatedTime: string;
}

export interface ExtendedChapter extends Chapter {
  novel: Novel;
  chapterNumber: number;
}

export interface LibraryStats {
  novelsCount?: number;
  chaptersCount?: number;
  chaptersRead?: number;
  chaptersUnread?: number;
  chaptersDownloaded?: number;
  sourcesCount?: number;
  genres?: Record<string, number>;
  status?: Record<string, number>;
}
