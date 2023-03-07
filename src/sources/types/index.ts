import { SelectedFilter, SourceFilter } from './filterTypes';
import { Languages } from '@utils/constants/languages';

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

export interface PopularNovelsResponse {
  novels: SourceNovelItem[];
}

export interface SourceOptions {
  showLatestNovels?: boolean;
  filters?: SelectedFilter;
}

export enum NovelStatus {
  Unknown = 'Unknown',
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  Licensed = 'Licensed',
  PublishingFinished = 'Publishing Finished',
  Cancelled = 'Cancelled',
  OnHiatus = 'On Hiatus',
}

export enum ScraperStatus {
  BROKEN = 'BROKEN',
  CANT_PARSE_CHAPTER = 'CANT PARSE CHAPTER',
  CANT_FETCH_IMAGE = 'CANT FETCH IMAGE', //parse chapter with text only (image error)
  OK = 'OK', //work perfectly
}

export interface Scraper {
  valid: () => Promise<string>;
  popularNovels: (
    pageNo: number,
    options?: SourceOptions,
  ) => Promise<PopularNovelsResponse>;
  parseNovelAndChapters: (
    novelUrl: string,
    start?: number,
    end?: number,
  ) => Promise<SourceNovel>;
  parseChapter: (
    novelUrl: string,
    chapterUrl: string,
  ) => Promise<SourceChapter>;
  searchNovels: (
    searchTerm: string,
    pageNo?: number,
  ) => Promise<SourceNovelItem[]>;
  fetchImage: (url: string) => Promise<string>; // base64
  name: string;
  version: string;
  site: string;
  lang: Languages;
  iconUrl?: string;
  url?: string; // the host url for scapper
  filters?: SourceFilter[];
}

export interface Plugin {
  name: string;
  version: string;
  site: string;
  lang: Languages;
  iconUrl?: string;
  path: string;
  url?: string;
  scraper: Scraper;
  status: ScraperStatus;
}
