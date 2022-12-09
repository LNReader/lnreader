import * as cheerio from 'cheerio';
import { Status } from '../helpers/constants';

const sourceId = 86;

const sourceName = 'NovelRingan';

const baseUrl = 'https://novelringan.com/';
const coverUriPrefix = 'https://i0.wp.com/novelringan.com/wp-content/uploads/';

const popularNovels = async page => {
  let totalPages = 402;
  const url = `${baseUrl}/top-novel/page/${page}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels = [];

  loadedCheerio('article.post').each(function () {
    const novelName = loadedCheerio(this).find('.entry-title').text()?.trim();
    const novelCover =
      coverUriPrefix + loadedCheerio(this).find('img').attr('data-sxrx');
    const novelUrl = loadedCheerio(this).find('h2 > a').attr('href');

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
    novelName: '',
    novelCover: '',
    genre: '',
    author: '',
    status: Status.UNKNOWN,
    artist: '',
    summary: '',
    chapters: [],
  };

  novel.novelName = loadedCheerio('.entry-title').text()?.trim();
  novel.novelCover =
    coverUriPrefix + loadedCheerio('img.ts-post-image').attr('data-sxrx');
  novel.summary = loadedCheerio(
    'body > div.site-container > div > main > article > div > div.maininfo > span > p',
  ).text();

  let genreSelector = loadedCheerio(
    'body > div.site-container > div > main > article > div > div.maininfo > span > ul > li:nth-child(4)',
  ).text();

  novel.genre = genreSelector.includes('Genre')
    ? genreSelector.replace('Genre:', '').trim()
    : '';

  let statusSelector = loadedCheerio(
    'body > div.site-container > div > main > article > div > div.maininfo > span > ul > li:nth-child(3)',
  ).text();

  novel.status = statusSelector.includes('Status')
    ? statusSelector.replace('Status:', '').trim()
    : Status.UNKNOWN;

  let chapters = [];

  loadedCheerio('.bxcl > ul > li').each(function () {
    const chapterName = loadedCheerio(this).find('a').text();
    const releaseDate = null;
    const chapterUrl = loadedCheerio(this).find('a').attr('href');

    const chapter = {
      chapterName,
      releaseDate,
      chapterUrl,
    };

    chapters.push(chapter);
  });

  novel.chapters = chapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  loadedCheerio('.entry-content div[style="display:none"]').remove();

  const chapterName = loadedCheerio('.entry-title').text();
  const chapterText = loadedCheerio('.entry-content').html();

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = baseUrl + '?s=' + searchTerm;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('article.post').each(function () {
    const novelName = loadedCheerio(this).find('.entry-title').text();
    const novelCover =
      coverUriPrefix + loadedCheerio(this).find('img').attr('data-sxrx');

    const novelUrl = loadedCheerio(this).find('h2 > a').attr('href');

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });
  return novels;
};

const NovelRinganScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelRinganScraper;
