import SourceFactory from '@sourcesV2/SourceFactory';
import { sourceManager } from '../../sources/sourceManager';

export const fetchNovel = async (sourceId, novelUrl) => {
  const source = SourceFactory.getSource(sourceId);

  console.log(novelUrl);

  const res = await source.getNovelDetails({ novelUrl });

  const novel = {
    novelUrl: res.novelUrl,
    sourceId: source.id,
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
  const source = SourceFactory.getSource(sourceId);

  let chapter = await source.getChapter({ novelUrl, chapterUrl });

  return chapter;
};

export const fetchChapters = async (sourceId, novelUrl) => {
  const source = SourceFactory.getSource(sourceId);

  const res = await source.getChapter({ novelUrl });

  const chapters = res.chapters;

  return chapters;
};
