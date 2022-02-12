export interface NovelInfo {
  novelId: number;
  url: string;
  novelUrl: string;
  sourceId: number;
  sourceName: string;
  novelName: string;
  novelCover?: string;
  summary?: string;
  genre?: string;
  author?: string;
  status?: string;
  followed: number;
}

export interface LibraryNovelInfo extends NovelInfo {
  chaptersUnread: number;
  chaptersDownloaded: number;
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

export interface DownloadedChapter {
  downloadId: number;
  downloadChapterId: number;
  chapterName: string | null;
  chapterText: string;
}

export interface History {
  historyId: number;
  sourceId: number;
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
  sourceId: number;
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
}
