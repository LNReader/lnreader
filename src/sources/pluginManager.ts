import RNFetchBlob from 'rn-fetch-blob';
import { showToast } from '../hooks/showToast';
import { bigger } from '../utils/compareVersion';

// packages for plugins
import * as cheerio from 'cheerio';
import { NovelStatus, PluginStatus, Plugin, PluginItem } from './types';
import { Languages } from '@utils/constants/languages';
import { htmlToText } from './helpers/htmlToText';
import { parseMadaraDate } from './helpers/parseDate';

const pluginsFolder = RNFetchBlob.fs.dirs.DownloadDir + '/LNReader/Plugins';

const packages: Record<string, any> = {
  'cheerio': cheerio,
  '../../src/pluginStatus': PluginStatus,
  '../../src/novelSatus': NovelStatus,
  '../../src/htmlToText': htmlToText,
  '../../src/parseMadaraDate': parseMadaraDate,
  '../../src/languages': Languages,
};

const _require = (packageName: string) => {
  return packages[packageName];
};

const initPlugin = async (rawCode: string, path?: string) => {
  const _module: any = { exports: {} };
  try {
    Function('require', 'module', rawCode)(_require, _module); //eslint-disable-line
    _module.exports.path = path || `${pluginsFolder}/${_module.exports.id}`;
    const plugin: Plugin = _module.exports;
    return plugin;
  } catch (e) {
    showToast('Some non-plugin files are found');
    return undefined;
  }
};

let plugins: Record<string, Plugin> = {};
const setPlugins = (_plugins: Record<string, Plugin>) => (plugins = _plugins);

// get existing plugin in device
const setupPlugin = async (path: string) => {
  const rawCode = await RNFetchBlob.fs.readFile(path, 'utf8');
  const plugin = await initPlugin(rawCode, path);
  if (plugin) {
    return plugin;
  }
  return undefined;
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
        const oldPlugin = plugins[plugin.id];
        if (!oldPlugin || bigger(plugin.version, oldPlugin.version)) {
          plugins[plugin.id] = plugin;
          setPlugins(plugins);
          RNFetchBlob.fs.writeFile(plugin.path, rawCode, 'utf8');
        } else {
          showToast('This plugin is not newer than current plugin');
        }
      });
  } catch (e: any) {
    showToast('Error');
  }
};

const uninstallPlugin = async (_plugin: PluginItem) => {
  const plugin = plugins[_plugin.id];
  if (plugin && (await RNFetchBlob.fs.exists(plugin.path))) {
    const newPlugins: Record<string, Plugin> = {};
    for (let id in plugins) {
      if (plugins[id].path !== plugin.path) {
        newPlugins[id] = plugins[id];
      }
    }
    setPlugins(newPlugins);
    RNFetchBlob.fs.unlink(plugin.path);
  } else {
    showToast('Plugin doesnt exist');
  }
};

const updatePlugin = async (plugin: PluginItem) => {
  installPlugin(plugin.url);
};

const collectPlugins = async () => {
  if (!(await RNFetchBlob.fs.exists(pluginsFolder))) {
    return;
  }
  const paths = await RNFetchBlob.fs.ls(pluginsFolder);
  for (let index = 0; index < paths.length; index++) {
    if (!(await RNFetchBlob.fs.isDir(paths[index]))) {
      const plugin = await setupPlugin(`${pluginsFolder}/${paths[index]}`);
      if (plugin) {
        plugins[plugin.id] = plugin;
      }
    }
  }
  setPlugins(plugins);
};

const fetchPlugins = async () => {
  const availablePlugins: Record<Languages, Array<PluginItem>> = await fetch(
    'https://raw.githubusercontent.com/nyagami/LNReader-plugins/master/plugins/plugins.json',
  ).then(res => res.json());
  return availablePlugins;
};

const getPlugin = (pluginId: string) => plugins[pluginId];

export {
  pluginsFolder,
  getPlugin,
  installPlugin,
  uninstallPlugin,
  updatePlugin,
  collectPlugins,
  fetchPlugins,
};
