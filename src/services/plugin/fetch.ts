import { getPlugin } from '@plugins/pluginManager';

export const fetchNovel = async (pluginId: string, novelUrl: string) => {
  const plugin = getPlugin(pluginId);
  const res = await plugin.parseNovelAndChapters(novelUrl);
  return res;
};

export const fetchChapter = async (pluginId: string, chapterUrl: string) => {
  const plugin = getPlugin(pluginId);
  let chapterText = `Not found plugin with id: ${pluginId}`;
  if (plugin) {
    chapterText = await plugin.parseChapter(chapterUrl);
  }
  return chapterText;
};

export const fetchChapters = async (pluginId: string, novelUrl: string) => {
  const plugin = getPlugin(pluginId);
  const res = await plugin.parseNovelAndChapters(novelUrl);

  const chapters = res.chapters;

  return chapters;
};
