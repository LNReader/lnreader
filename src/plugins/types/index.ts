import { SelectedFilter, SourceFilter } from './filterTypes';
import { Languages } from '@utils/constants/languages';

// id must be provided by SQLite

export interface NovelItem {
  name: string;
  url: string; //must be absoulute
  cover?: string;
}

export interface ChapterItem {
  name: string;
  url: string; //must be absoulute
  releaseTime?: string;
}

export interface SourceNovel {
  url: string; //must be absoulute
  name: string;
  cover?: string;
  genres?: string;
  summary?: string;
  author?: string;
  artist?: string;
  status?: string;
  chapters?: ChapterItem[];
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

export enum PluginStatus {
  BROKEN = 'BROKEN',
  CANT_PARSE_CHAPTER = 'CANT PARSE CHAPTER',
  CANT_FETCH_IMAGE = 'CANT FETCH IMAGE', //parse chapter with text only (image error)
  OK = 'OK', //work perfectly
}

// this is for display in available plugins
export interface PluginItem {
  id: string;
  name: string;
  lang: Languages;
  version: string;
  iconUrl: string;
  url: string; // the url of raw code
  description?: string;
}

export interface Plugin extends PluginItem {
  popularNovels: (
    pageNo: number,
    options?: SourceOptions,
  ) => Promise<NovelItem[]>;
  parseNovelAndChapters: (
    novelUrl: string,
    pageNo?: number,
  ) => Promise<SourceNovel>;
  parseChapter: (chapterUrl: string) => Promise<string>; // yes, just string
  searchNovels: (searchTerm: string, pageNo?: number) => Promise<NovelItem[]>;
  fetchImage: (url: string) => Promise<string>; // base64
  protected: boolean; // true if you cant host their resources in other sites
  site: string;
  path: string;
  filters?: SourceFilter[];
}
