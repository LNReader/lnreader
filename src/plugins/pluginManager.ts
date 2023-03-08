import RNFS from 'react-native-fs';
import { showToast } from '../hooks/showToast';
import { bigger } from '../utils/compareVersion';

// packages for plugins
import * as cheerio from 'cheerio';
import { NovelStatus, PluginStatus, Plugin, PluginItem } from './types';
import { Languages } from '@utils/constants/languages';
import { htmlToText } from './helpers/htmlToText';
import { parseMadaraDate } from './helpers/parseDate';
import { isUrlAbsolute } from '@utils/isAbsoluteUrl';

const pluginsFolder = RNFS.DownloadDirectoryPath + '/LNReader/Plugins';

const packages: Record<string, any> = {
  'cheerio': cheerio,
  '../../src/pluginStatus': PluginStatus,
  '../../src/novelSatus': NovelStatus,
  '../../src/languages': Languages,
  '../../src/htmlToText': htmlToText,
  '../../src/parseMadaraDate': parseMadaraDate,
  '../../src/isAbsoluteUrl': isUrlAbsolute,
};

const _require = (packageName: string) => {
  return packages[packageName];
};

const initPlugin = async (rawCode: string, path?: string) => {
  const _module: any = { exports: {} };
  try {
    Function('require', 'module', rawCode)(_require, _module); // eslint-disable-line no-new-func
    _module.exports.path = path || `${pluginsFolder}/${_module.exports.id}.js`;
    const plugin: Plugin = _module.exports;
    return plugin;
  } catch (e) {
    showToast('Some non-plugin files are found');
    return undefined;
  }
};

let plugins: Record<string, Plugin> = {};

// get existing plugin in device
const setupPlugin = async (path: string) => {
  const rawCode = await RNFS.readFile(path, 'utf8');
  const plugin = await initPlugin(rawCode, path);
  if (plugin) {
    return plugin;
  }
  return undefined;
};

const installPlugin = async (url: string) => {
  try {
    fetch(url)
      .then(res => res.text())
      .then(async rawCode => {
        const plugin = await initPlugin(rawCode);
        if (!plugin) {
          return;
        }
        const oldPlugin = plugins[plugin.id];
        if (!oldPlugin || bigger(plugin.version, oldPlugin.version)) {
          plugins[plugin.id] = plugin;
          await RNFS.writeFile(plugin.path, rawCode, 'utf8');
        } else {
          showToast('This plugin is the newtest version');
        }
      });
  } catch (e: any) {
    showToast('Error');
  }
};

const uninstallPlugin = async (_plugin: PluginItem) => {
  const plugin = plugins[_plugin.id];
  if (plugin && (await RNFS.exists(plugin.path))) {
    delete plugins[plugin.id];
    await RNFS.unlink(plugin.path);
  } else {
    showToast('Plugin doesnt exist');
  }
};

const updatePlugin = async (plugin: PluginItem) => {
  installPlugin(plugin.url);
};

const collectPlugins = async () => {
  if (!(await RNFS.exists(pluginsFolder))) {
    await RNFS.mkdir(pluginsFolder);
    return;
  }
  const paths = await RNFS.readDir(pluginsFolder);
  for (let i = 0; i < paths.length; i++) {
    const plugin = await setupPlugin(paths[i].path);
    if (plugin) {
      plugins[plugin.id] = plugin;
    }
  }
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
