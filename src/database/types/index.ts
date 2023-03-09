import { NovelStatus } from '@plugins/types';
export interface NovelInfo {
  id: number;
  url: string;
  pluginId: string;
  name: string;
  cover?: string;
  summary?: string;
  author?: string;
  artist?: string;
  status?: NovelStatus;
  genres?: string;
  inLibrary: number;
}

export interface LibraryNovelInfo extends NovelInfo {
  category: string;
  chaptersUnread: number;
  chaptersDownloaded: number;
}

export interface ChapterItem {
  id: number;
  novelId: number;
  url: string;
  name: string;
  release?: string;
  bookmark: number;
  unread: number;
  isDownloaded: number;
}

export interface DownloadedChapter {
  id: number;
  chapterId: number;
  chapterText: string;
  updateTime: string;
}

export interface History {
  id: number;
  pluginId: string;
  novelId: number;
  chapterId: number;
  novelName: string;
  novelUrl: string;
  novelCover: string;
  chapterName: string;
  chapterUrl: string;
  historyTimeRead: string;
  bookmark: number;
}

export interface Update {
  pluginId: string;
  novelId: number;
  novelName: string;
  novelUrl: string;
  novelCover: string;
  chapterId: number;
  chapterUrl: string;
  chapterName: string;
  updateTime: string;
  releaseTime: string;
}

export interface Category {
  id: number;
  name: string;
  sort: number | null;
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
