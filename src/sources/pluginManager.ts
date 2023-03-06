import RNFetchBlob from 'rn-fetch-blob';
import { showToast } from '../hooks/showToast';
import { bigger } from '../utils/compareVersion';

import { SourceChapter, SourceNovel, SourceNovelItem } from './types';
import { SelectedFilter, SourceFilter } from './types/filterTypes';

// packages for plugins
import * as cheerio from 'cheerio';

interface PopularNovelsResponse {
  novels: SourceNovelItem[];
}

export interface SourceOptions {
  showLatestNovels?: boolean;
  filters?: SelectedFilter;
}

export enum ScraperStatus {
  BROKEN = 'BROKEN',
  CANT_PARSE_CHAPTER = 'CANT PARSE CHAPTER',
  CANT_FETCH_IMAGE = 'CANT FETCH IMAGE', //parse chapter with text only (image error)
  OK = 'OK', //work perfectly
}

interface Scraper {
  valid: () => ScraperStatus;
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
  fetchImage: (url: string) => string; // base64
  name: string;
  version: string;
  site: string;
  iconUrl?: string;
  url?: string; // the host url for scapper
  filters?: SourceFilter[];
}

export interface Plugin {
  name: string;
  version: string;
  site: string;
  iconUrl?: string;
  path: string;
  url?: string;
  scraper: Scraper;
  status: ScraperStatus;
}

const packages: Record<string, any> = {
  'cheerio': cheerio,
};

const _require = (packageName: string) => {
  return packages[packageName];
};

let plugins: Array<Plugin> = [];

const initPlugin = async (rawCode: string, path?: string) => {
  const _module: any = { exports: {} };
  let scraper: Scraper;
  try {
    Function('require', 'module', rawCode)(_require, _module); //eslint-disable-line
    scraper = _module.exports;
  } catch (e) {
    showToast('Some non-scraper files are found');
    return undefined;
  }

  const plugin: Plugin = {
    name: scraper.name,
    version: scraper.version,
    site: scraper.site,
    iconUrl: scraper.iconUrl,
    url: scraper.url || undefined,
    path:
      path || `${RNFetchBlob.fs.dirs.DownloadDir}/Plugins/${scraper.name}.js`,
    scraper: scraper,
    status: scraper.valid() as ScraperStatus,
  };
  return plugin;
};

// get existing plugin in device
const setupPlugin = async (path: string) => {
  const rawCode = await RNFetchBlob.fs.readFile(path, 'utf8');
  const plugin = await initPlugin(rawCode, path);
  if (plugin) {
    plugins.push(plugin);
  }
};

const installPlugin = async (url: string) => {
  try {
    RNFetchBlob.fetch('get', url)
      .then(res => res.text())
      .then(async rawCode => {
        const plugin = await initPlugin(rawCode);
        if (!plugin) {
          return;
        }
        const oldPlugin = plugins.find(element => element.name === plugin.name);
        if (!oldPlugin || bigger(plugin.version, oldPlugin.version)) {
          plugins.push(plugin);
          RNFetchBlob.fs.writeFile(plugin.path, rawCode, 'utf8');
        } else {
          showToast('This plugin is not newer than current plugin');
        }
      });
  } catch (e: any) {
    // console.log(e);
  }
};

const uninstallPlugin = async (path: string) => {
  if (await RNFetchBlob.fs.exists(path)) {
    plugins = plugins.filter(element => element.path !== path);
    RNFetchBlob.fs.unlink(path);
  } else {
    showToast('Plugin doesnt exist');
  }
};

const updatePlugin = async (plugin: Plugin) => {
  if (plugin.url) {
    installPlugin(plugin.url);
  } else {
    showToast('This plugin doenst have the url');
  }
};

const collectPlugin = async () => {
  const paths = await RNFetchBlob.fs.ls(
    `${RNFetchBlob.fs.dirs.DownloadDir}/Plugins`,
  );
  for (let path in paths) {
    if (await RNFetchBlob.fs.isDir(path)) {
      setupPlugin(path);
    }
  }
};

export const PluginManager = {
  initPlugin,
  setupPlugin,
  installPlugin,
  uninstallPlugin,
  updatePlugin,
  collectPlugin,
};
