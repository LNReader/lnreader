import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';

const sourceId = 3;
const baseUrl = 'https://fastnovel.net';
const searchUrl = 'https://fastnovel.net/search/';

const popularNovels = async page => {
  let totalPages = 39;
  const url = `${baseUrl}/list/most-popular.html?page=${page}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.film-item').each(function () {
    const novelName = loadedCheerio(this).find('.name').text();
    const novelCover = loadedCheerio(this).find('.img').attr('data-original');
    const novelUrl = loadedCheerio(this).find('a').attr('href').substring(1);

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
  const url = `${baseUrl}/${novelUrl}/`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName: 'FastNovel',
    url,
    novelUrl,
  };

  novel.novelName = loadedCheerio('h1').text();

  novel.novelCover = loadedCheerio('.book-cover').attr('data-original');

  novel.summary = loadedCheerio('div.film-content > p').text();

  novel.author = loadedCheerio('li > label')
    .filter(function () {
      return loadedCheerio(this).text().trim() === 'Author:';
    })
    .next()
    .text();

  novel.genre = loadedCheerio('li')
    .filter(function () {
      return loadedCheerio(this).find('label').text().trim() === 'Genre:';
    })
    .text()
    .replace('Genre:', '');

  novel.artist = null;

  novel.status = null;

  novel.status = loadedCheerio('li')
    .filter(function () {
      return loadedCheerio(this).find('label').text().trim() === 'Status:';
    })
    .text()
    .includes('Completed')
    ? 'Completed'
    : 'Ongoing';

  let novelChapters = [];

  loadedCheerio('.chapter').each(function () {
    const chapterName = loadedCheerio(this).text();
    const releaseDate = null;
    let chapterUrl = loadedCheerio(this).attr('href');
    chapterUrl = chapterUrl.replace(`/${novelUrl}/`, '');

    const chapter = {
      chapterName,
      releaseDate,
      chapterUrl,
    };

    novelChapters.push(chapter);
  });

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}/${novelUrl}/${chapterUrl}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.episode-name').text();

  let chapterText = loadedCheerio('#chapter-body').html();
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
  const url = `${searchUrl}${searchTerm}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.film-item').each(function () {
    const novelName = loadedCheerio(this).find('div.title > p.name').text();
    const novelCover = loadedCheerio(this).find('.img').attr('data-original');
    const novelUrl = loadedCheerio(this).find('a').attr('href').substring(1);

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

const fastNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default fastNovelScraper;
