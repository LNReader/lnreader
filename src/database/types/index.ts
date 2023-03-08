export interface NovelInfo {
  novelId: number;
  sourceUrl: string;
  novelUrl: string;
  pluginId: string;
  source: string;
  novelName: string;
  novelCover?: string;
  novelSummary?: string;
  genre?: string;
  author?: string;
  status?: string;
  followed: number;
  categoryIds: string;
}

export interface LibraryNovelInfo extends NovelInfo {
  chaptersUnread: number;
  chaptersDownloaded: number;
  categoryIds: string;
}

export interface ChapterItem {
  chapterId: number;
  novelId: number;
  chapterUrl: string;
  chapterName: string;
  releaseDate?: string;
  read: number;
  bookmark: number;
  downloaded: number;
}
export interface ChapterItemExtended extends ChapterItem {
  novelId: number;
  novelUrl: string;
  pluginId: string;
  novelName: string;
}

export interface DownloadedChapter {
  downloadId: number;
  downloadChapterId: number;
  chapterName: string | null;
  chapterText: string;
}

export interface History {
  historyId: number;
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
  updateId: number;
  pluginId: string;
  novelId: number;
  novelName: string;
  novelUrl: string;
  novelCover: string;
  chapterId: number;
  chapterUrl: string;
  chapterName: string;
  downloaded: number;
  read: number;
  updateTime: string;
  bookmark: number;
  releaseDate: string;
}

export interface Category {
  id: number;
  name: string;
  lastUpdatedAt: Date;
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
