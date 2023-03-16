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

export class PluginWorker {
  private instance: Plugin;
  id: string;
  name: string;
  site: string;
  version: string;
  path: string;
  filters?: SourceFilter[];
  protected: boolean;
  shareVar: any;

  constructor(plugin: Plugin) {
    this.instance = plugin;
    this.id = plugin.id;
    this.name = plugin.name;
    this.site = plugin.site;
    this.version = plugin.version;
    this.path = plugin.path;
    this.filters = plugin.filters;
    this.protected = plugin.protected || false;
  }

  /** re-send request @max times ( @timeOut per one ) if object is undefined **/
  sendRequestTimeOut = (
    action: CallableFunction,
    max: number,
    timeOut: number,
    onError?: CallableFunction,
  ) => {
    if (max === 0) {
      return onError?.();
    }
    action();
    setTimeout(() => {
      if (this.shareVar === undefined) {
        this.sendRequestTimeOut(action, max - 1, timeOut);
      }
    }, timeOut);
  };

  popularNovels = (
    pageNo: number,
    options?: SourceOptions,
  ): Promise<NovelItem[]> => {
    this.shareVar = undefined;
    return new Promise(resolve => {
      this.sendRequestTimeOut(
        () =>
          this.instance.popularNovels(pageNo, options).then(res => {
            this.shareVar = res;
            resolve(res);
          }),
        2,
        300,
      );
    });
  };

  parseNovelAndChapters = (novelUrl: string): Promise<SourceNovel> => {
    this.shareVar = undefined;
    return new Promise(resolve => {
      this.sendRequestTimeOut(
        () =>
          this.instance.parseNovelAndChapters(novelUrl).then(res => {
            this.shareVar = res;
            resolve(res);
          }),
        2,
        300,
      );
    });
  };

  parseChapter = async (chapterUrl: string): Promise<string> => {
    this.shareVar = undefined;
    return await new Promise(resolve => {
      this.sendRequestTimeOut(
        () =>
          this.instance.parseChapter(chapterUrl).then(res => {
            this.shareVar = res;
            resolve(res);
          }),
        2,
        200,
        () => {
          resolve('cant download');
        },
      );
    });
  };

  searchNovels = (searchTerm: string): Promise<NovelItem[]> => {
    this.shareVar = undefined;
    return new Promise(resolve => {
      this.sendRequestTimeOut(
        () =>
          this.instance.searchNovels(searchTerm).then(res => {
            this.shareVar = res;
            resolve(res);
          }),
        2,
        200,
      );
    });
  };

  fetchImage = async (url: string) => {
    const base64 = await fetch(url).then(res => res.text());
    return base64;
  };
}
