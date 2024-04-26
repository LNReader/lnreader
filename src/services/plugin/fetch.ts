import { getPlugin } from '@plugins/pluginManager';
import { isUrlAbsolute } from '@plugins/helpers/isAbsoluteUrl';

export const fetchNovel = async (pluginId: string, novelPath: string) => {
  const plugin = getPlugin(pluginId);
  if (!plugin) {
    throw new Error(`Unknown plugin: ${pluginId}`);
  }
  const res = await plugin.parseNovel(novelPath);
  return res;
};

export const fetchImage = async (pluginId: string, imageUrl: string) => {
  const plugin = getPlugin(pluginId);
  if (!plugin) {
    throw new Error(`Unknown plugin: ${pluginId}`);
  }
  return plugin.fetchImage(imageUrl);
};

export const fetchChapter = async (pluginId: string, chapterPath: string) => {
  const plugin = getPlugin(pluginId);
  let chapterText = `Unkown plugin: ${pluginId}`;
  if (plugin) {
    chapterText = await plugin.parseChapter(chapterPath);
  }
  return chapterText;
};

export const fetchChapters = async (pluginId: string, novelPath: string) => {
  const plugin = getPlugin(pluginId);
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
  const plugin = getPlugin(pluginId);
  if (!plugin || !plugin.parsePage) {
    throw new Error('Cant parse page!');
  }
  const res = await plugin.parsePage(novelPath, page);
  return res;
};

export const resolveUrl = (
  pluginId: string,
  path: string,
  isNovel?: boolean,
) => {
  if (isUrlAbsolute(path)) {
    return path;
  }
  const plugin = getPlugin(pluginId);
  try {
    if (!plugin) {
      throw new Error(`Unknown plugin: ${pluginId}`);
    }
    if (plugin.resolveUrl) {
      return plugin.resolveUrl(path, isNovel);
    }
  } catch (e) {
    return path;
  }
  return plugin.site + path;
};
