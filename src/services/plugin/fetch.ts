import { getPluginAsync } from '@plugins/pluginManager';
import { isUrlAbsolute } from '@plugins/helpers/isAbsoluteUrl';

export const fetchNovel = async (pluginId: string, novelPath: string) => {
  const plugin = await getPluginAsync(pluginId);
  if (!plugin) {
    throw new Error(`Unknown plugin: ${pluginId}`);
  }
  const res = await plugin.parseNovel(novelPath);
  return res;
};

export const fetchChapter = async (pluginId: string, chapterPath: string) => {
  const plugin = await getPluginAsync(pluginId);
  let chapterText = `Unkown plugin: ${pluginId}`;
  if (plugin) {
    chapterText = await plugin.parseChapter(chapterPath);
  }
  return chapterText;
};

export const fetchChapters = async (pluginId: string, novelPath: string) => {
  const plugin = await getPluginAsync(pluginId);
  if (!plugin) {
    throw new Error(`Unknown plugin: ${pluginId}`);
  }
  const res = await plugin.parseNovel(novelPath);
  return res?.chapters;
};

export const fetchPage = async (
  pluginId: string,
  novelPath: string,
  page: string,
) => {
  const plugin = await getPluginAsync(pluginId);
  if (!plugin || !plugin.parsePage) {
    throw new Error('Cant parse page!');
  }
  return await plugin.parsePage(novelPath, page);
};

export const resolveUrl = async (
  pluginId: string,
  path: string,
  isNovel?: boolean,
) => {
  if (isUrlAbsolute(path)) {
    return path;
  }
  const plugin = await getPluginAsync(pluginId);
  try {
    if (!plugin) {
      throw new Error(`Unknown plugin: ${pluginId}`);
    }
    if (plugin.resolveUrl) {
      return await plugin.resolveUrl(path, isNovel);
    }
  } catch (e) {
    return path;
  }
  return plugin.site + path;
};
