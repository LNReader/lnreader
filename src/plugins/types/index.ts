import { SelectedFilter, SourceFilter } from './filterTypes';
import { Languages } from '@utils/constants/languages';

export interface Source {
  pluginId: string;
  sourceName: string;
  url: string;
  lang: string;
  icon: string;
  isNsfw?: boolean;
}

export interface SourceNovelItem {
  pluginId: string;
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
  pluginId: string;
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
  pluginId: string;
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
  description: string;
}

export interface Plugin extends PluginItem {
  valid: () => Promise<PluginStatus>;
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
  protected: boolean; // true if you cant host their resources in other sites
  site: string;
  path: string;
  filters?: SourceFilter[];
}
