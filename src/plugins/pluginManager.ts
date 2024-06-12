import { reverse, uniqBy } from 'lodash-es';
import { newer } from '@utils/compareVersion';
import { store } from './helpers/storage';

// packages for plugins
import { load } from 'cheerio';
import dayjs from 'dayjs';
import qs from 'qs';
import { NovelStatus, Plugin, PluginItem } from './types';
import { FilterTypes } from './types/filterTypes';
import { isUrlAbsolute } from './helpers/isAbsoluteUrl';
import { fetchApi, fetchProto, fetchText } from './helpers/fetch';
import { defaultCover } from './helpers/constants';
import { Storage, LocalStorage, SessionStorage } from './helpers/storage';
import { encode, decode } from 'urlencode';
import { Parser } from 'htmlparser2';
import FileManager from '@native/FileManager';
import { getRepositoriesFromDb } from '@database/queries/RepositoryQueries';
import { showToast } from '@utils/showToast';
import { PLUGIN_STORAGE } from '@utils/Storages';

const packages: Record<string, any> = {
  'htmlparser2': { Parser },
  'cheerio': { load },
  'dayjs': dayjs,
  'qs': qs,
  'urlencode': { encode, decode },
  '@libs/novelStatus': { NovelStatus },
  '@libs/fetch': { fetchApi, fetchText, fetchProto },
  '@libs/isAbsoluteUrl': { isUrlAbsolute },
  '@libs/filterInputs': { FilterTypes },
  '@libs/defaultCover': { defaultCover },
};

const initPlugin = (pluginId: string, rawCode: string) => {
  try {
    const _require = (packageName: string) => {
      if (packageName === '@libs/storage') {
        return {
          storage: new Storage(pluginId),
          localStorage: new LocalStorage(pluginId),
          sessionStorage: new SessionStorage(pluginId),
        };
      }
      return packages[packageName];
    };
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

const installPlugin = async (
  pluginId: string,
  url: string,
): Promise<Plugin | undefined> => {
  try {
    return await fetch(url, {
      headers: { 'pragma': 'no-cache', 'cache-control': 'no-cache' },
    })
      .then(res => res.text())
      .then(async rawCode => {
        const plugin = initPlugin(pluginId, rawCode);
        if (!plugin) {
          return undefined;
        }
        let currentPlugin = plugins[plugin.id];
        if (!currentPlugin || newer(plugin.version, currentPlugin.version)) {
          plugins[plugin.id] = plugin;
          currentPlugin = plugin;

          // save plugin code;
          const pluginDir = `${PLUGIN_STORAGE}/${pluginId}`;
          await FileManager.mkdir(pluginDir);
          const filePath = pluginDir + '/index.js';
          await FileManager.writeFile(filePath, rawCode);
        }
        return currentPlugin;
      });
  } catch (e: any) {
    throw e;
  }
};

const uninstallPlugin = async (_plugin: PluginItem) => {
  plugins[_plugin.id] = undefined;
  store.getAllKeys().forEach(key => {
    if (key.startsWith(_plugin.id)) {
      store.delete(key);
    }
  });
  const pluginFilePath = `${PLUGIN_STORAGE}/${_plugin.id}/index.js`;
  if (await FileManager.exists(pluginFilePath)) {
    await FileManager.unlink(pluginFilePath);
  }
};

const updatePlugin = async (plugin: PluginItem) => {
  return installPlugin(plugin.id, plugin.url);
};

const fetchPlugins = async (): Promise<PluginItem[]> => {
  const allPlugins: PluginItem[] = [];
  const allRepositories = await getRepositoriesFromDb();

  const repoPluginsRes = await Promise.allSettled(
    allRepositories.map(({ url }) => fetch(url).then(res => res.json())),
  );

  repoPluginsRes.forEach(repoPlugins => {
    if (repoPlugins.status === 'fulfilled') {
      allPlugins.push(...repoPlugins.value);
    } else {
      showToast(repoPlugins.reason.toString());
    }
  });

  return uniqBy(reverse(allPlugins), 'id');
};

const getPlugin = (pluginId: string) => {
  if (!plugins[pluginId]) {
    const filePath = `${PLUGIN_STORAGE}/${pluginId}/index.js`;
    try {
      const code = FileManager.readFile(filePath);
      const plugin = initPlugin(pluginId, code);
      plugins[pluginId] = plugin;
    } catch {
      // file doesnt exist
    }
  }
  return plugins[pluginId];
};

const LOCAL_PLUGIN_ID = 'local';

export {
  getPlugin,
  installPlugin,
  uninstallPlugin,
  updatePlugin,
  fetchPlugins,
  LOCAL_PLUGIN_ID,
};
