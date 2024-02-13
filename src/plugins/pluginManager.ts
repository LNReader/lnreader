import RNFS from 'react-native-fs';
import { PluginDownloadFolder } from '@utils/constants/download';
import { newer } from '@utils/compareVersion';
import { Language } from '@utils/constants/languages';

// packages for plugins
import { load } from 'cheerio';
import dayjs from 'dayjs';
import { NovelStatus, Plugin, PluginItem } from './types';
import { FilterTypes } from './types/filterTypes';
import { isUrlAbsolute } from './helpers/isAbsoluteUrl';
import { fetchApi, fetchFile, fetchText } from './helpers/fetch';
import { defaultCover } from './helpers/constants';
import { encode, decode } from 'urlencode';
import { getString } from '@strings/translations';

const pluginsFilePath = PluginDownloadFolder + '/plugins.json';

const packages: Record<string, any> = {
  'cheerio': { load },
  'dayjs': dayjs,
  'urlencode': { encode, decode },
  '@libs/novelStatus': { NovelStatus },
  '@libs/fetch': { fetchApi, fetchFile, fetchText },
  '@libs/isAbsoluteUrl': { isUrlAbsolute },
  '@libs/filterInputs': { FilterTypes },
  '@libs/defaultCover': { defaultCover },
};

const _require = (packageName: string) => {
  return packages[packageName];
};

const initPlugin = (rawCode: string) => {
  try {
    /* eslint no-new-func: "off", curly: "error" */
    const plugin: Plugin = Function(
      'require',
      'module',
      `const exports = module.exports = {}; 
      ${rawCode}; 
      return exports.default`,
    )(_require, {});
    return plugin;
  } catch (e) {
    return undefined;
  }
};

const plugins: Record<string, Plugin | undefined> = {};

const serializePlugin = async (
  pluginId: string,
  rawCode: string,
  installed: boolean,
) => {
  let serializedPlugins: Record<string, string> = {};
  if (await RNFS.exists(pluginsFilePath)) {
    const content = await RNFS.readFile(pluginsFilePath);
    serializedPlugins = JSON.parse(content);
  }
  if (installed) {
    serializedPlugins[pluginId] = rawCode;
  } else {
    delete serializedPlugins[pluginId];
  }
  if (!(await RNFS.exists(PluginDownloadFolder))) {
    await RNFS.mkdir(PluginDownloadFolder);
  }
  await RNFS.writeFile(pluginsFilePath, JSON.stringify(serializedPlugins));
};

const deserializePlugins = async () => {
  if (await RNFS.exists(pluginsFilePath)) {
    const content = await RNFS.readFile(pluginsFilePath);
    const serializedPlugins: Record<string, string> = JSON.parse(content);
    for (const pluginId in serializedPlugins) {
      const plugin = initPlugin(serializedPlugins[pluginId]);
      if (plugin) {
        plugins[pluginId] = plugin;
      }
    }
  }
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
          return undefined;
        }
        let currentPlugin = plugins[plugin.id];
        if (!currentPlugin || newer(plugin.version, currentPlugin.version)) {
          plugins[plugin.id] = plugin;
          currentPlugin = plugin;
          await serializePlugin(plugin.id, rawCode, true);
        }
        return currentPlugin;
      });
  } catch (e: any) {
    throw e;
  }
};

const uninstallPlugin = async (_plugin: PluginItem) => {
  delete plugins[_plugin.id];
  serializePlugin(_plugin.id, '', false);
};

const updatePlugin = async (plugin: PluginItem) => {
  return installPlugin(plugin.url);
};

const fetchPlugins = async () => {
  // plugins host
  const githubUsername = 'LNReader';
  const githubRepository = 'lnreader-sources';

  const availablePlugins: Record<Language, Array<PluginItem>> = await fetch(
    `https://raw.githubusercontent.com/${githubUsername}/${githubRepository}/beta-dist/.dist/plugins.min.json`,
  )
    .then(res => res.json())
    .catch(() => {
      throw new Error(
        `${getString(
          'browseScreen.pluginsHostError',
        )}: ${githubUsername}/${githubRepository}`,
      );
    });
  return availablePlugins;
};

const getPlugin = (pluginId: string) => plugins[pluginId];

const LOCAL_PLUGIN_ID = 'local';

export {
  getPlugin,
  installPlugin,
  uninstallPlugin,
  updatePlugin,
  deserializePlugins,
  fetchPlugins,
  LOCAL_PLUGIN_ID,
};
