import RNFS from 'react-native-fs';
import { reverse, uniqBy } from 'lodash-es';
import { PluginDownloadFolder } from '@utils/constants/download';
import { newer } from '@utils/compareVersion';

// packages for plugins
import { load } from 'cheerio';
import dayjs from 'dayjs';
import qs from 'qs';
import { NovelStatus, Plugin, PluginItem } from './types';
import { FilterTypes } from './types/filterTypes';
import { isUrlAbsolute } from './helpers/isAbsoluteUrl';
import { fetchApi, fetchFile, fetchProto, fetchText } from './helpers/fetch';
import { defaultCover } from './helpers/constants';
import { encode, decode } from 'urlencode';
import { Parser } from 'htmlparser2';
import TextFile from '@native/TextFile';
import { getRepositoriesFromDb } from '@database/queries/RepositoryQueries';
import { showToast } from '@utils/showToast';

const pluginsFilePath = PluginDownloadFolder + '/plugins.json';

const packages: Record<string, any> = {
  'htmlparser2': { Parser },
  'cheerio': { load },
  'dayjs': dayjs,
  'qs': qs,
  'urlencode': { encode, decode },
  '@libs/novelStatus': { NovelStatus },
  '@libs/fetch': { fetchApi, fetchFile, fetchText, fetchProto },
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
let serializedPlugins: Record<string, string | undefined>;

const serializePlugin = async (
  pluginId: string,
  rawCode: string,
  installed: boolean,
) => {
  if (!serializedPlugins) {
    if (await RNFS.exists(pluginsFilePath)) {
      const content = await TextFile.readFile(pluginsFilePath);
      serializedPlugins = JSON.parse(content);
    } else {
      serializedPlugins = {};
    }
  }
  if (installed) {
    serializedPlugins[pluginId] = rawCode;
  } else {
    serializedPlugins[pluginId] = undefined;
  }
  if (!(await RNFS.exists(PluginDownloadFolder))) {
    await RNFS.mkdir(PluginDownloadFolder);
  }
  await TextFile.writeFile(pluginsFilePath, JSON.stringify(serializedPlugins));
};

const deserializePlugins = () => {
  return TextFile.readFile(pluginsFilePath)
    .then(content => {
      serializedPlugins = JSON.parse(content);
      for (const script of Object.values(serializedPlugins)) {
        const plugin = initPlugin(script as string);
        if (plugin) {
          plugins[plugin.id] = plugin;
        }
      }
    })
    .catch(() => {
      // nothing to read
    });
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
  plugins[_plugin.id] = undefined;
  return serializePlugin(_plugin.id, '', false);
};

const updatePlugin = async (plugin: PluginItem) => {
  return installPlugin(plugin.url);
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
