import { getPlugin } from '@plugins/pluginManager';
import { SourceNovel } from '@plugins/types';

export const fetchNovel = async (pluginId: string, novelUrl: string) => {
  const plugin = getPlugin(pluginId);
  const res = await plugin.parseNovelAndChapters(novelUrl);
  return {
    ...res,
    inLibrary: 0,
    pluginId: pluginId,
    pluginName: plugin.name,
  } as SourceNovel;
};

export const fetchChapter = async (
  pluginId: string,
  novelUrl: string,
  chapterUrl: string,
) => {
  const plugin = getPlugin(pluginId);

  let chapter = await plugin.parseChapter(novelUrl, chapterUrl);

  return chapter;
};

export const fetchChapters = async (pluginId: string, novelUrl: string) => {
  const plugin = getPlugin(pluginId);

  const res = await plugin.parseNovelAndChapters(novelUrl);

  const chapters = res.chapters;

  return chapters;
};
