import { SelectedFilter, SourceFilter } from './filterTypes';
import { Languages } from '@utils/constants/languages';

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

export enum NovelStatus {
  Unknown = 'Unknown',
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  Licensed = 'Licensed',
  PublishingFinished = 'Publishing Finished',
  Cancelled = 'Cancelled',
  OnHiatus = 'On Hiatus',
}

export interface SourceNovel {
  url: string; //must be absoulute
  name: string;
  cover?: string;
  genres?: string;
  summary?: string;
  author?: string;
  artist?: string;
  status?: NovelStatus;
  chapters?: ChapterItem[];
}

export interface SourceOptions {
  showLatestNovels?: boolean;
  filters?: SelectedFilter;
}

// this is for display in available plugins
export interface PluginItem {
  id: string;
  name: string;
  site: string;
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
