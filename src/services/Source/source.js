import { getPlugin } from '@plugins/pluginManager';

export const fetchNovel = async (pluginId, novelUrl) => {
  const plugin = getPlugin(pluginId);

  const res = await plugin.parseNovelAndChapters(novelUrl);

  const novel = {
    novelUrl: res.novelUrl,
    pluginUrl: res.url,
    plugin: res.pluginName,
    pluginId: res.pluginId,
    novelName: res.novelName,
    novelCover: res.novelCover,
    novelSummary: res.summary,
    author: res.author,
    artist: res.artist,
    status: res.status,
    genre: res.genre,
    followed: 0,
    chapters: res.chapters,
  };

  return novel;
};

export const fetchChapter = async (pluginId, novelUrl, chapterUrl) => {
  const plugin = getPlugin(pluginId);

  let chapter = await plugin.parseChapter(novelUrl, chapterUrl);

  return chapter;
};

export const fetchChapters = async (pluginId, novelUrl) => {
  const plugin = getPlugin(pluginId);

  const res = await plugin.parseNovelAndChapters(novelUrl);

  const chapters = res.chapters;

  return chapters;
};
