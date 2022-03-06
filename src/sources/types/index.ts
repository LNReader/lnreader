export interface Source {
  sourceId: number;
  sourceName: string;
  url: string;
  lang: string;
  icon: string;
  isNsfw?: boolean;
}

export interface SourceNovelItem {
  sourceId: number;
  novelName: string;
  novelUrl: string;
  novelCover?: string;
}

export interface SourceChapterItem {
  chapterName: string;
  chapterUrl: string;
  releaseDate?: string | null;
}

export interface SourceNovel {
  sourceId: number;
  sourceName: string;
  url: string;
  novelUrl: string;
  novelName?: string;
  novelCover?: string;
  genre?: string;
  summary?: string;
  author?: string;
  status?: string;
  chapters?: SourceChapterItem[];
}

export interface SourceChapter {
  sourceId: number;
  novelUrl: string;
  chapterUrl: string;
  chapterName?: string;
  chapterText?: string;
}

export enum Status {
  Unknown = 'Unknown',
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  Licensed = 'Licensed',
  PublishingFinished = 'Publishing Finished',
  Cancelled = 'Cancelled',
  OnHiatus = 'On Hiatus',
}
