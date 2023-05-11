import RNFS from 'react-native-fs';
import { showToast } from '../hooks/showToast';
import { bigger } from '../utils/compareVersion';

// packages for plugins
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { NovelStatus, Plugin, PluginItem } from './types';
import { FilterInputs } from './types/filterTypes';
import { Languages } from '@utils/constants/languages';
import { fetchFile } from './helpers/fetchFile';
import { parseMadaraDate } from './helpers/parseDate';
import { isUrlAbsolute } from '@utils/isAbsoluteUrl';
import { fetchApi } from '@utils/fetch/fetch';

const pluginsFolder = RNFS.ExternalDirectoryPath + '/Plugins';

const packages: Record<string, any> = {
  'cheerio': cheerio,
  'dayjs': dayjs,
  '@libs/novelStatus': NovelStatus,
  '@libs/languages': Languages,
  '@libs/fetchFile': fetchFile,
  '@libs/parseMadaraDate': parseMadaraDate,
  '@libs/isAbsoluteUrl': isUrlAbsolute,
  '@libs/fetchApi': fetchApi,
  '@libs/filterInputs': FilterInputs,
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
      `${rawCode}; return module.exports`,
    )(_require, {});
    plugin.path = path || `${pluginsFolder}/${plugin.id}.js`;
    return plugin;
  } catch (e) {
    return undefined;
  }
};

let plugins: Record<string, Plugin> = {};

// get existing plugin in device
const setupPlugin = async (path: string) => {
  const rawCode = await RNFS.readFile(path, 'utf8');
  const plugin = await initPlugin(rawCode, path);
  if (!plugin) {
    showToast(`Invalid script in: ${path}`);
  }
  return plugin;
};

const installPlugin = async (url: string): Promise<Plugin | undefined> => {
  try {
    return await fetch(url)
      .then(res => res.text())
      .then(async rawCode => {
        const plugin = initPlugin(rawCode);
        if (!plugin) {
          showToast(`Invalid script from ${url}`);
          return undefined;
        }
        const oldPlugin = plugins[plugin.id];
        if (oldPlugin) {
          if (bigger(plugin.version, oldPlugin.version)) {
            delete plugins[oldPlugin.id];
            plugins[plugin.id] = plugin;
            await RNFS.writeFile(plugin.path, rawCode, 'utf8');
            return plugin;
          } else {
            showToast(`There's no newer version than ${oldPlugin.version}`);
            return oldPlugin;
          }
        } else {
          plugins[plugin.id] = plugin;
          await RNFS.writeFile(plugin.path, rawCode, 'utf8');
          showToast(`Installed ${plugin.name}`);
          return plugin;
        }
      });
  } catch (e: any) {
    showToast(e.message);
    return undefined;
  }
};

const uninstallPlugin = async (_plugin: PluginItem) => {
  const plugin = plugins[_plugin.id];
  if (plugin && (await RNFS.exists(plugin.path))) {
    delete plugins[plugin.id];
    await RNFS.unlink(plugin.path);
  }
  showToast(`Uninstalled ${_plugin.name}`);
};

const updatePlugin = async (plugin: PluginItem) => {
  const updated = await installPlugin(plugin.url);
  if (updated && bigger(updated.version, plugin.version)) {
    showToast(`Updated ${updated.name} to ${updated.version}`);
  }
  return updated;
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
  // plugins host
  const githubRepository = 'LNReader/lnreader-sources';
  const githubBranch = 'plugins';

  const availablePlugins: Record<Languages, Array<PluginItem>> = await fetch(
    `https://raw.githubusercontent.com/${githubRepository}/${githubBranch}/plugins/plugins.min.json`,
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
