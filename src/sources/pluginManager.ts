import RNFetchBlob from 'rn-fetch-blob';
import { showToast } from '../hooks/showToast';
import { bigger } from '../utils/compareVersion';

// packages for plugins
import * as cheerio from 'cheerio';
import { NovelStatus, ScraperStatus, Scraper, Plugin } from './types';
import { Languages } from '@utils/constants/languages';
import { htmlToText } from './helpers/htmlToText';
import { parseMadaraDate } from './helpers/parseDate';

export const pluginsFolder =
  RNFetchBlob.fs.dirs.DownloadDir + 'LNReader/Plugins';

const packages: Record<string, any> = {
  'cheerio': cheerio,
  '../../src/scraperStatus': ScraperStatus,
  '../../src/novelSatus': NovelStatus,
  '../../src/htmlToText': htmlToText,
  '../../src/parseMadaraDate': parseMadaraDate,
  '../../src/languages': Languages,
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
    lang: scraper.lang,
    iconUrl: scraper.iconUrl,
    url: scraper.url || undefined,
    path: path || `${pluginsFolder}/${scraper.site}-${scraper.name}.js`,
    //plugins cant have the same site so there's no overwriting when dowlooad
    scraper: scraper,
    status: (await scraper.valid()) as ScraperStatus,
  };
  return plugin;
};

// get existing plugin in device
export const setupPlugin = async (path: string) => {
  const rawCode = await RNFetchBlob.fs.readFile(path, 'utf8');
  const plugin = await initPlugin(rawCode, path);
  if (plugin) {
    plugins.push(plugin);
  }
};

export const installPlugin = async (url: string) => {
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

export const uninstallPlugin = async (path: string) => {
  if (await RNFetchBlob.fs.exists(path)) {
    plugins = plugins.filter(element => element.path !== path);
    RNFetchBlob.fs.unlink(path);
  } else {
    showToast('Plugin doesnt exist');
  }
};

export const updatePlugin = async (plugin: Plugin) => {
  if (plugin.url) {
    installPlugin(plugin.url);
  } else {
    showToast('This plugin doenst have the url');
  }
};

export const collectPlugins = async () => {
  const paths = await RNFetchBlob.fs.ls(pluginsFolder);
  for (let index = 0; index < paths.length; index++) {
    if (!(await RNFetchBlob.fs.isDir(paths[index]))) {
      setupPlugin(`${pluginsFolder}/${paths[index]}`);
    }
  }
};

export const getPlugin = (name: string) => {
  return plugins.find(element => element.name === name);
};

export const PluginManager = {
  initPlugin,
  setupPlugin,
  installPlugin,
  uninstallPlugin,
  updatePlugin,
  collectPlugins,
  getPlugin,
};
