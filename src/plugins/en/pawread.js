import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';

const sourceId = 147;
const sourceName = 'PawRead';

const baseUrl = 'https://pawread.com/';

const popularNovels = async page => {
  const url = `${baseUrl}list/click/?page=${page}/`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.col-lg-2').each(function () {
    const novelName = loadedCheerio(this).find('a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl =
      baseUrl + loadedCheerio(this).find('a').attr('href').slice(1);

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const body = await fetchHtml({ url: novelUrl, sourceId: sourceId });

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
  };

  novel.novelName = loadedCheerio('.col-md-9 > h1:nth-child(2)').text().trim();

  novel.novelCover = loadedCheerio('.col-md-3 > div')
    .attr('style')
    .replace(/.*\((.*?)\)/g, '$1');

  novel.author = loadedCheerio(
    '#views_info > div:nth-child(4) > span:nth-child(2)',
  )
    .text()
    .replace(/(Author: )/g, '');

  novel.status = loadedCheerio('.label').text().trim();

  novel.genre = loadedCheerio('div.mt20:nth-child(4)')
    .text()
    .trim()
    .replace(/\s/g, ',');

  novel.summary = loadedCheerio('#simple-des').text().trim();

  let chapters = [];

  loadedCheerio('div.filtr-item').each(function () {
    const chapterName = loadedCheerio(this).find('.c_title').text();
    const releaseDate = loadedCheerio(this)
      .find('.c_title')
      .next()
      .next()
      .text();
    const chapterUrl =
      baseUrl +
      loadedCheerio(this)
        .find('.item-box')
        .attr('onclick')
        .replace(/.*?(novel.*html).*/g, '$1');

    chapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = chapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const body = await fetchHtml({
    url: chapterUrl,
    sourceId: sourceId,
  });

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio(
    'div.panel:nth-child(2) > div > div > h3',
  ).text();
  const chapterText = loadedCheerio('#chapter_item').html();

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
  const url = `${baseUrl}search/?keywords=${searchTerm}`;

  const body = await fetchHtml({ url, sourceId });

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.col-lg-2').each(function () {
    const novelName = loadedCheerio(this).find('a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl =
      baseUrl + loadedCheerio(this).find('a').attr('href').slice(1);

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return novels;
};

const PawReadScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default PawReadScraper;
