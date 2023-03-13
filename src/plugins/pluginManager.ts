import RNFS from 'react-native-fs';
import { showToast } from '../hooks/showToast';
import { bigger } from '../utils/compareVersion';

// packages for plugins
import * as cheerio from 'cheerio';
import axios from 'axios';
import { NovelStatus, PluginStatus, Plugin, PluginItem } from './types';
import { Languages } from '@utils/constants/languages';
import { htmlToText } from './helpers/htmlToText';
import { parseMadaraDate } from './helpers/parseDate';
import { isUrlAbsolute } from '@utils/isAbsoluteUrl';

const pluginsFolder = RNFS.ExternalDirectoryPath + '/Plugins';

const packages: Record<string, any> = {
  'cheerio': cheerio,
  'axios': axios,
  '@libs/pluginStatus': PluginStatus,
  '@libs/novelSatus': NovelStatus,
  '@libs/languages': Languages,
  '@libs/htmlToText': htmlToText,
  '@libs/parseMadaraDate': parseMadaraDate,
  '@libs/isAbsoluteUrl': isUrlAbsolute,
};

const _require = (packageName: string) => {
  return packages[packageName];
};

const initPlugin = (rawCode: string, path?: string) => {
  try {
    /* eslint no-new-func: "off", curly: "error" */
    const plugin: Plugin = Function(
      'require',
      'module',
      `${rawCode}; return module.exports;`,
    )(_require, {});
    plugin.path = path || `${pluginsFolder}/${plugin.id}.js`;
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
        const plugin = initPlugin(rawCode);
        if (!plugin) {
          return;
        }
        const oldPlugin = plugins[plugin.id];
        if (oldPlugin) {
          if (bigger(plugin.version, oldPlugin.version)) {
            delete plugins[oldPlugin.id];
            plugins[plugin.id] = plugin;
            await RNFS.writeFile(plugin.path, rawCode, 'utf8');
            return true;
          } else {
            showToast('This plugin is the newtest version');
          }
        } else {
          plugins[plugin.id] = plugin;
          await RNFS.writeFile(plugin.path, rawCode, 'utf8');
          showToast('Downloaded!');
          return true;
        }
      });
  } catch (e: any) {
    showToast('Error');
  }
  return false;
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
  const updated = await installPlugin(plugin.url);
  if (updated) {
    showToast('Updated!');
  }
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
    'https://raw.githubusercontent.com/nyagami/LNReader-plugins/master/plugins/plugins.json?newtest=true',
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
