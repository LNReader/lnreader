export enum NovelStatus {
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  Licensed = 'Licensed',
  PublishingFinished = 'Publishing finished',
  Cancelled = 'Cancelled',
  OnHiatus = 'On hiatus',
  Unknown = 'Unknown',
}

export interface GetPopularNovelsParams {
  page?: number;

  showLatest?: boolean;

  filters?: SelectedFilters;
}

export interface GetSearchNovelsParams {
  searchTerm: string;

  page?: number;

  filters?: SelectedFilters;
}

export interface GetNovelDetailsParams {
  novelUrl: string;
}

export interface GetChapterParams {
  /**
   *  @deprecated
   */
  novelUrl: string;

  chapterUrl: string;
}

export interface SourceNovelsResponse {
  novels: SourceNovel[];
}

export interface SourceChapter {
  chapterNumber?: number;

  chapterName: string;

  chapterUrl: string;

  releaseDate?: number | null;

  chapterText?: string | null;

  translator?: string;
}

export interface SourceNovel {
  sourceId: number;

  novelName: string;

  novelUrl: string;

  novelCover?: string | null;

  /**
   * Comma separated Genres. Ex. "Action,Adventure,Drama"
   */
  genre?: string;

  summary?: string;

  author?: string;

  artist?: string;

  status?: NovelStatus;

  chapters?: SourceChapter[];
}

export interface Source {
  id: number;

  name: string;

  baseUrl: string;

  iconUrl: string;

  /**
   * An ISO 639-1 compliant language code (two letters in lower case).
   */
  lang: string;

  isNsfw?: boolean;

  isLatestSupported?: boolean;
}

export interface ParsedSource extends Source {
  getPopoularNovels?: ({
    page,
  }: GetPopularNovelsParams) => Promise<SourceNovelsResponse>;

  getSearchNovels?: ({
    searchTerm,
  }: GetSearchNovelsParams) => Promise<SourceNovelsResponse>;

  getNovelDetails?: ({
    novelUrl,
  }: GetNovelDetailsParams) => Promise<SourceNovel>;

  getChapter?: ({ chapterUrl }: GetChapterParams) => Promise<SourceChapter>;

  filters?: SourceFilter[];
}

interface FilterOption {
  label: string;
  value: string | number;
}

export enum FilterInput {
  TextInput,
  Picker,
  Checkbox,
}

export interface SourceFilter {
  key: string;

  label: string;

  values: FilterOption[];

  inputType: FilterInput;
}

export type SelectedFilters = Record<string, string | string[]>;
