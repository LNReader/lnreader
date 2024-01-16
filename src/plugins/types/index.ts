import { FilterToValues, Filters } from './filterTypes';
import { Language } from '@utils/constants/languages';

export interface NovelItem {
  name: string;
  url: string; //must be absoulute
  cover?: string;
}

export interface ChapterItem {
  name: string;
  url: string; //must be absoulute
  chapterNumber?: number;
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

export interface PopularNovelsOptions<Q extends Filters> {
  showLatestNovels?: boolean;
  filters?: FilterToValues<Q>;
}

// this is for display in available plugins
export interface PluginItem {
  id: string;
  name: string;
  site: string;
  lang: Language;
  version: string;
  url: string; // the url of raw code
  iconUrl: string;
  hasUpdate?: boolean;
}

export interface Plugin extends PluginItem {
  path: string; // path in device
  filters?: Filters;
  userAgent: string;
  rawCode: string;
  popularNovels: (
    pageNo: number,
    options?: PopularNovelsOptions<Filters>,
  ) => Promise<NovelItem[]>;
  parseNovelAndChapters: (
    novelUrl: string,
    pageNo?: number,
  ) => Promise<SourceNovel>;
  parseChapter: (chapterUrl: string) => Promise<string>;
  searchNovels: (searchTerm: string, pageNo: number) => Promise<NovelItem[]>;
  fetchImage: (url: string) => Promise<string>;
  updateUserAgent: (newUserAgent: string) => Promise<void>;
}
