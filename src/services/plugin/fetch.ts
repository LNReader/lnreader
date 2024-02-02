import { getPlugin } from '@plugins/pluginManager';

export const fetchNovel = async (pluginId: string, novelUrl: string) => {
  const plugin = getPlugin(pluginId);
  const res = await plugin.parseNovelAndChapters(novelUrl).catch(e => {
    throw e;
  });
  return res;
};

export const fetchImage = async (pluginId: string, imageUrl: string) => {
  return getPlugin(pluginId)
    .fetchImage(imageUrl)
    .catch(e => {
      throw e;
    });
};

export const fetchChapter = async (pluginId: string, chapterUrl: string) => {
  const plugin = getPlugin(pluginId);
  let chapterText = `Not found plugin with id: ${pluginId}`;
  if (plugin) {
    chapterText = await plugin.parseChapter(chapterUrl).catch(e => {
      throw e;
    });
  }
  return chapterText;
};

export const fetchChapters = async (pluginId: string, novelUrl: string) => {
  const plugin = getPlugin(pluginId);
  const res = await plugin.parseNovelAndChapters(novelUrl).catch(e => {
    throw e;
  });

  const chapters = res.chapters;

  return chapters;
};
