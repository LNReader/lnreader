import { reverse, uniqBy } from 'lodash-es';
import { newer } from '@utils/compareVersion';
import { store } from './helpers/storage';

// packages for plugins
import { Plugin, PluginItem } from './types';
import { downloadFile } from './helpers/fetch';
import FileManager from '@native/FileManager';
import { getRepositoriesFromDb } from '@database/queries/RepositoryQueries';
import { showToast } from '@utils/showToast';
import { PLUGIN_STORAGE } from '@utils/Storages';
import { getPluginThread } from '@plugins/async/pluginThread';

const pluginThread = getPluginThread();

const initPlugin = async (pluginId: string, rawCode: string) => {
  return await pluginThread.initPlugin(pluginId, rawCode);
};

const plugins: Record<string, Plugin | undefined> = {};

const installPlugin = async (
  _plugin: PluginItem,
): Promise<Plugin | undefined> => {
  try {
    const rawCode = await fetch(_plugin.url, {
      headers: { 'pragma': 'no-cache', 'cache-control': 'no-cache' },
    }).then(res => res.text());
    const plugin = await initPlugin(_plugin.id, rawCode);
    if (!plugin) {
      return undefined;
    }
    let currentPlugin = plugins[plugin.id];
    if (!currentPlugin || newer(plugin.version, currentPlugin.version)) {
      plugins[plugin.id] = plugin;
      currentPlugin = plugin;

      // save plugin code;
      const pluginDir = `${PLUGIN_STORAGE}/${plugin.id}`;
      await FileManager.mkdir(pluginDir);
      const pluginPath = pluginDir + '/index.js';
      const customJSPath = pluginDir + '/custom.js';
      const customCSSPath = pluginDir + '/custom.css';
      if (_plugin.customJS) {
        await downloadFile(_plugin.customJS, customJSPath);
      } else if (await FileManager.exists(customJSPath)) {
        FileManager.unlink(customJSPath);
      }
      if (_plugin.customCSS) {
        await downloadFile(_plugin.customCSS, customCSSPath);
      } else if (await FileManager.exists(customCSSPath)) {
        FileManager.unlink(customCSSPath);
      }
      await FileManager.writeFile(pluginPath, rawCode);
    }
    return currentPlugin;
  } catch (e: any) {
    console.error(e.stack);
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
  return installPlugin(plugin);
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

const loadingPlugins = new Map();

const getPluginAsync = async (
  pluginId: string,
): Promise<Plugin | undefined> => {
  if (!plugins[pluginId]) {
    let loading = loadingPlugins.get(pluginId);
    if (loading) {
      return await loading;
    }
    const filePath = `${PLUGIN_STORAGE}/${pluginId}/index.js`;
    try {
      const code = FileManager.readFile(filePath);

      //TODO: make sure this doesent cause issues
      loadingPlugins.set(pluginId, initPlugin(pluginId, code));
      plugins[pluginId] = await loadingPlugins.get(pluginId);
      loadingPlugins.delete(pluginId);
    } catch {
      // file doesnt exist
      loadingPlugins.delete(pluginId);
    }
  }
  return plugins[pluginId];
};

const getPlugin = (pluginId: string) => {
  if (!plugins[pluginId]) {
    console.log('Sync getPlugin before plugin is loaded! ' + new Error().stack);
    //getPluginAsync will make sure plugin is loaded
    getPluginAsync(pluginId);
  }
  return plugins[pluginId];
};

const LOCAL_PLUGIN_ID = 'local';

export {
  getPlugin,
  getPluginAsync,
  installPlugin,
  uninstallPlugin,
  updatePlugin,
  fetchPlugins,
  LOCAL_PLUGIN_ID,
};
