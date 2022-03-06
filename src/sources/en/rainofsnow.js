import * as cheerio from 'cheerio';
import { Status } from '../helpers/constants';

const sourceId = 78;

const sourceName = 'RainOfSnow';

const baseUrl = 'https://rainofsnow.com/';

const popularNovels = async page => {
  let url = baseUrl + 'novels/page/' + page;

  const totalPages = 5;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.minbox').each(function () {
    const novelName = loadedCheerio(this).find('h3').text();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');
    const novelUrl = loadedCheerio(this).find('h3 > a').attr('href');

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return { novels, totalPages };
};

const parseNovelAndChapters = async novelUrl => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = { sourceId, sourceName, url, novelUrl };

  novel.novelName = loadedCheerio('h2').text().trim();

  novel.novelCover = loadedCheerio('.imagboca1 > img').attr('data-src');

  novel.summary = loadedCheerio('#synop').text().trim();

  novel.genre = loadedCheerio(
    'body > div.queen > div > div > div.row > div.col-md-12.col-lg-7 > div > div.backcolor1 > ul > li:nth-child(5) > small',
  )
    .text()
    .trim();

  novel.author = loadedCheerio(
    'body > div.queen > div > div > div.row > div.col-md-12.col-lg-7 > div > div.backcolor1 > ul > li:nth-child(2) > small',
  ).text();

  novel.status = Status.UNKNOWN;

  let novelChapters = [];

  loadedCheerio('#chapter')
    .find('li')
    .each(function () {
      const chapterName = loadedCheerio(this)
        .find('.chapter')
        .first()
        .text()
        .trim();
      const releaseDate = loadedCheerio(this).find('small').text();
      const chapterUrl = loadedCheerio(this).find('a').attr('href');

      if (chapterUrl && chapterName) {
        novelChapters.push({ chapterName, releaseDate, chapterUrl });
      }
    });

  const delay = ms => new Promise(res => setTimeout(res, ms));

  let page = 1;

  let nextPageExists = loadedCheerio('.next.page-numbers').length;

  while (nextPageExists) {
    const chaptersUrl = `${url}page/${++page}/#chapter`;

    const chaptersRequest = await fetch(chaptersUrl);
    const chaptersHtml = await chaptersRequest.text();

    loadedCheerio = cheerio.load(chaptersHtml);

    nextPageExists = loadedCheerio('.next.page-numbers').length;

    loadedCheerio('#chapter')
      .find('li')
      .each(function () {
        const chapterName = loadedCheerio(this)
          .find('.chapter')
          .first()
          .text()
          .trim();
        const releaseDate = loadedCheerio(this).find('small').text();
        const chapterUrl = loadedCheerio(this).find('a').attr('href');

        if (chapterUrl && chapterName) {
          novelChapters.push({ chapterName, releaseDate, chapterUrl });
        }
      });

    delay(1000);
  }

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(chapterUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('.content > h2').text();
  let chapterText = loadedCheerio('.content').html();

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
  let url = baseUrl + '?s=' + searchTerm;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.minbox').each(function () {
    const novelName = loadedCheerio(this).find('h3').text();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');
    const novelUrl = loadedCheerio(this).find('h3 > a').attr('href');

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

const RainOfSnowScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default RainOfSnowScraper;
