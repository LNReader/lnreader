import { sourceManager } from '../../sources/sourceManager';

export const fetchNovel = async (sourceId, novelUrl) => {
  const source = sourceManager(sourceId);

  const res = await source.parseNovelAndChapters(novelUrl);

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
    chapters: res.chapters,
  };

  return novel;
};

export const fetchChapter = async (sourceId, novelUrl, chapterUrl) => {
  const source = sourceManager(sourceId);

  let chapter = await source.parseChapter(novelUrl, chapterUrl);

  return chapter;
};

export const fetchChapters = async (sourceId, novelUrl) => {
  const source = sourceManager(sourceId);

  const res = await source.parseNovelAndChapters(novelUrl);

  const chapters = res.chapters;

  return chapters;
};
