import * as cheerio from 'cheerio';
import { isUrlAbsolute } from '../../utils/isAbsoluteUrl';
import { showToast } from '../../hooks/showToast';
import {
  SourceChapter,
  SourceChapterItem,
  SourceNovel,
  SourceNovelItem,
} from '../types';

const sourceId = 112;
const sourceName = 'FreeNovelUpdates';
const baseUrl = 'https://www.freenovelupdates.com';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const popularNovels = async (page: number) => {
  const url = 'https://www.freenovelupdates.com/genres/light-novel-1002';

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels: SourceNovelItem[] = [];

  loadedCheerio('.books-item').each(function () {
    let novelUrl = loadedCheerio(this).find('a').attr('href');

    if (novelUrl && !isUrlAbsolute(novelUrl)) {
      novelUrl = baseUrl + novelUrl;
    }

    if (novelUrl) {
      const novelName = loadedCheerio(this).find('.title').text().trim();
      let novelCover = loadedCheerio(this).find('img').attr('src');

      if (novelCover && !isUrlAbsolute(novelCover)) {
        novelCover = baseUrl + novelCover;
      }

      const novel = {
        sourceId,
        novelUrl,
        novelName,
        novelCover,
      };

      novels.push(novel);
    }
  });

  return { novels };
};

const parseNovelAndChapters = async (novelUrl: string) => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const novel: SourceNovel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
    chapters: [],
  };

  novel.novelName = loadedCheerio('h1').text();

  let novelCover = loadedCheerio('.img > img').attr('src');

  novel.novelCover = novelCover
    ? isUrlAbsolute(novelCover)
      ? novelCover
      : baseUrl + novelCover
    : undefined;

  novel.summary = loadedCheerio('.description-content').text().trim();

  novel.author = loadedCheerio('.author').text().trim();

  novel.genre = loadedCheerio('.category').text().trim();

  novel.status = loadedCheerio('.status').text().trim();

  loadedCheerio('.chapter').each(function () {
    let chapterUrl = loadedCheerio(this).find('a').attr('href');

    if (chapterUrl && !isUrlAbsolute(chapterUrl)) {
      chapterUrl = baseUrl + chapterUrl;
    }

    if (chapterUrl) {
      const chapterName = loadedCheerio(this).find('a').text().trim();
      const releaseDate = null;

      const chapter: SourceChapterItem = {
        chapterName,
        releaseDate,
        chapterUrl,
      };

      novel.chapters?.push(chapter);
    }
  });

  return novel;
};

const parseChapter = async (novelUrl: string, chapterUrl: string) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1').text();
  const chapterText = loadedCheerio('.content').html() || '';

  const chapter: SourceChapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const searchNovels = async (searchTerm: string) => {
  showToast('Search is not available in this source');

  return [];
};

const FreeNovelUpdatesScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default FreeNovelUpdatesScraper;
