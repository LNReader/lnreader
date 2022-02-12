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

export interface DownloadedChapter {
  downloadId: number;
  downloadChapterId: number;
  chapterName: string | null;
  chapterText: string;
}
