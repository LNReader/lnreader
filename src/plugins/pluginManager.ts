import RNFS from 'react-native-fs';
import { PluginDownloadFolder } from '@utils/constants/download';
import { showToast } from '../hooks/showToast';
import { bigger } from '../utils/compareVersion';
import { Languages } from '@utils/constants/languages';

// packages for plugins
import { load } from 'cheerio';
import dayjs from 'dayjs';
import { NovelStatus, Plugin, PluginItem } from './types';
import { FilterTypes } from './types/filterTypes';
import { parseMadaraDate } from './helpers/parseDate';
import { isUrlAbsolute } from '@utils/isAbsoluteUrl';
import { fetchApi, fetchFile } from '@utils/fetch/fetch';
import { defaultCover } from './helpers/constants';

const packages: Record<string, any> = {
  'cheerio': { load },
  'dayjs': dayjs,
  '@libs/novelStatus': { NovelStatus },
  '@libs/fetch': { fetchApi, fetchFile },
  '@libs/parseMadaraDate': { parseMadaraDate },
  '@libs/isAbsoluteUrl': { isUrlAbsolute },
  '@libs/filterInputs': { FilterTypes },
  '@libs/showToast': { showToast },
  '@libs/defaultCover': { defaultCover },
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
      `const exports = module.exports = {}; 
      ${rawCode}; 
      return exports.default`,
    )(_require, {});
    plugin.path = path || `${PluginDownloadFolder}/${plugin.id}.js`;
    plugin.rawCode = rawCode;
    plugin.updateUserAgent = async function (newUserAgent) {
      this.userAgent = newUserAgent;
      this.rawCode = this.rawCode.replace(
        /(userAgent\s*=\s*)([^\n;]*)/,
        `$1"${newUserAgent}"`,
      );
      await RNFS.writeFile(this.path, this.rawCode, 'utf8');
    };
    plugin.updateCookieString = async function (newCookieString) {
      this.cookieString = newCookieString;
      this.rawCode = this.rawCode.replace(
        /(cookieString\s*=\s*)([^\n;]*)/,
        `$1"${newCookieString}"`,
      );
      await RNFS.writeFile(this.path, this.rawCode, 'utf8');
    };
    return plugin;
  } catch (e) {
    return undefined;
  }
};

let plugins: Record<string, Plugin> = {};

// get existing plugin in device
const setupPlugin = async (path: string) => {
  const rawCode = await RNFS.readFile(path, 'utf8');
  const plugin = initPlugin(rawCode, path);
  if (!plugin) {
    showToast(`Invalid script in: ${path}`);
  }
  return plugin;
};

const installPlugin = async (url: string): Promise<Plugin | undefined> => {
  try {
    return await fetch(url, {
      headers: { 'pragma': 'no-cache', 'cache-control': 'no-cache' },
    })
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
  if (!(await RNFS.exists(PluginDownloadFolder))) {
    await RNFS.mkdir(PluginDownloadFolder);
    return;
  }
  const paths = await RNFS.readDir(PluginDownloadFolder);
  for (let i = 0; i < paths.length; i++) {
    const plugin = await setupPlugin(paths[i].path);
    if (plugin) {
      plugins[plugin.id] = plugin;
    }
  }
};

const fetchPlugins = async () => {
  // plugins host
  const githubUsername = 'skillgg';
  const githubRepository = 'lnplugins';
  const githubBranch = 'filters_redesign';

  const availablePlugins: Record<Languages, Array<PluginItem>> = await fetch(
    `https://raw.githubusercontent.com/${githubUsername}/${githubRepository}/${githubBranch}/.dist/${githubUsername}/plugins.min.json`,
  ).then(res => res.json());
  return availablePlugins;
};

const getPlugin = (pluginId: string) => plugins[pluginId];

const LOCAL_PLUGIN_ID = 'local';

export {
  getPlugin,
  installPlugin,
  uninstallPlugin,
  updatePlugin,
  collectPlugins,
  fetchPlugins,
  LOCAL_PLUGIN_ID,
};
