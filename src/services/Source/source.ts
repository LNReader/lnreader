import { sourceManager } from '../../sources/sourceManager';
import { unifiedParser, unifiedParserMap } from './unifiedParser';

export const fetchNovel = async (sourceId: number, novelUrl: string) => {
  const source = sourceManager(sourceId);

  const res = await source.parseNovelAndChapters(novelUrl);

  const chapters = res.chapters?.map(unifiedParserMap);

  const novel = {
    novelUrl: res.novelUrl,
    sourceUrl: res.url,
    source: res.sourceName,
    sourceId: res.sourceId,
    novelName: res.novelName,
    novelCover: res.novelCover,
    novelSummary: res.summary,
    author: res.author,
    artist: res.artist,
    status: res.status,
    genre: res.genre,
    followed: 0,
    chapters: chapters,
  };

  return novel;
};

export const fetchChapter = async (
  sourceId: number,
  novelUrl: string,
  chapterUrl: string,
) => {
  const source = sourceManager(sourceId);

  let chapter = await source.parseChapter(novelUrl, chapterUrl);
  chapter = await unifiedParser(chapter);

  return unifiedParser(chapter);
};

export const fetchChapters = async (sourceId: number, novelUrl: string) => {
  const source = sourceManager(sourceId);

  const res = await source.parseNovelAndChapters(novelUrl);

  const chapters = res.chapters?.map(unifiedParserMap);

  return chapters;
};
