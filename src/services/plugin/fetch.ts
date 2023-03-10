import { getPlugin } from '@plugins/pluginManager';

export const fetchNovel = async (pluginId: string, novelUrl: string) => {
  const plugin = getPlugin(pluginId);
  const res = await plugin.parseNovelAndChapters(novelUrl);
  return res;
};

export const fetchChapter = async (pluginId: string, chapterUrl: string) => {
  const plugin = getPlugin(pluginId);

  let chapter = await plugin.parseChapter(chapterUrl);

  return chapter;
};

export const fetchChapters = async (pluginId: string, novelUrl: string) => {
  const plugin = getPlugin(pluginId);

  const res = await plugin.parseNovelAndChapters(novelUrl);

  const chapters = res.chapters;

  return chapters;
};
