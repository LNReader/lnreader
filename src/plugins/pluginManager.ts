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
          return undefined;
        }
        const oldPlugin = plugins[plugin.id];
        if (oldPlugin) {
          if (newer(plugin.version, oldPlugin.version)) {
            plugins[oldPlugin.id] = plugin;
            await RNFS.writeFile(plugin.path, rawCode, 'utf8');
            return plugin;
          } else {
            return oldPlugin;
          }
        } else {
          plugins[plugin.id] = plugin;
          await RNFS.writeFile(plugin.path, rawCode, 'utf8');
          return plugin;
        }
      });
  } catch (e: any) {
    throw e;
  }
};

const uninstallPlugin = async (_plugin: PluginItem) => {
  const plugin = plugins[_plugin.id];
  if (plugin && (await RNFS.exists(plugin.path))) {
    delete plugins[plugin.id];
    await RNFS.unlink(plugin.path);
  }
};

const updatePlugin = async (plugin: PluginItem) => {
  return installPlugin(plugin.url);
};

const collectPlugins = async () => {
  if (!(await RNFS.exists(PluginDownloadFolder))) {
    await RNFS.mkdir(PluginDownloadFolder);
    return;
  }
  const paths = await RNFS.readDir(PluginDownloadFolder);
  for (let item of paths) {
    const plugin = await setupPlugin(item.path);
    if (plugin) {
      plugins[plugin.id] = plugin;
    }
  }
};

const fetchPlugins = async () => {
  // plugins host
  const githubUsername = 'LNReader';
  const githubRepository = 'lnreader-sources';

  const availablePlugins: Record<Language, Array<PluginItem>> = await fetch(
    `https://raw.githubusercontent.com/${githubUsername}/${githubRepository}/dist/.dist/plugins.min.json`,
  )
    .then(res => res.json())
    .catch(() => {
      throw new Error(
        `Plugins host error: ${githubUsername}/${githubRepository}`,
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
  collectPlugins,
  fetchPlugins,
  LOCAL_PLUGIN_ID,
};
