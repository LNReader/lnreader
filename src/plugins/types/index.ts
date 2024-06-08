import { FilterToValues, Filters } from './filterTypes';

export interface NovelItem {
  name: string;
  path: string;
  cover?: string;
}

export interface ChapterItem {
  name: string;
  path: string;
  chapterNumber?: number;
  releaseTime?: string;
  page?: string;
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

export interface SourceNovel extends NovelItem {
  genres?: string;
  summary?: string;
  author?: string;
  artist?: string;
  status?: NovelStatus;
  chapters: ChapterItem[];
  totalPages?: number;
}

export interface SourcePage {
  chapters: ChapterItem[];
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
  lang: string;
  version: string;
  url: string; // the url of raw code
  iconUrl: string;
  hasUpdate?: boolean;
}

export interface ImageRequestInit {
  [x: string]: string | Record<string, string> | Headers | FormData | undefined;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface Plugin extends PluginItem {
  imageRequestInit?: ImageRequestInit;
  filters?: Filters;
  popularNovels: (
    pageNo: number,
    options?: PopularNovelsOptions<Filters>,
  ) => Promise<NovelItem[]>;
  parseNovel: (novelPath: string) => Promise<SourceNovel>;
  parsePage?: (novelPath: string, page: string) => Promise<SourcePage>;
  parseChapter: (chapterPath: string) => Promise<string>;
  searchNovels: (searchTerm: string, pageNo: number) => Promise<NovelItem[]>;
  resolveUrl?: (path: string, isNovel?: boolean) => string;
  webStorageUtilized?: boolean;
}
