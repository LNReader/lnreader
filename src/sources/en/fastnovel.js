import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';

const sourceId = 3;
const baseUrl = 'https://fastnovel.org';
const searchUrl = 'https://fastnovel.org/search/';

const popularNovels = async page => {
  let totalPages = 39;
  const url = `${baseUrl}/sort/p/?page=${page}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.list-novel .row').each(function () {
    const novelName = loadedCheerio(this).find('h3.novel-title > a').text();
    const novelCover = loadedCheerio(this).find('img.cover').attr('src');
    const novelUrl = loadedCheerio(this)
      .find('h3.novel-title > a')
      .attr('href');

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
  const url = `${novelUrl}/`;
  const body = await fetchHtml({ url, sourceId });

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName: 'FastNovel',
    url,
    novelUrl,
  };

  novel.novelName = loadedCheerio('div.book > img').attr('alt');

  novel.novelCover = loadedCheerio('div.book > img').attr('src');

  novel.summary = loadedCheerio('div.desc-text').text().trim();

  novel.author = loadedCheerio('ul.info > li > h3')
    .filter(function () {
      return loadedCheerio(this).text().trim() === 'Author:';
    })
    .siblings()
    .text();
  novel.genre = loadedCheerio('ul.info > li')
    .filter(function () {
      return loadedCheerio(this).find('h3').text().trim() === 'Genre:';
    })
    .text()
    .trim()
    .replace('Genre:', '')
    .trim();

  novel.status = loadedCheerio('ul.info > li > h3')
    .filter(function () {
      return loadedCheerio(this).text().trim() === 'Status:';
    })
    .next()
    .text();

  const novelId = loadedCheerio('#rating').attr('data-novel-id');

  const getChapters = async id => {
    const chapterListUrl = baseUrl + '/ajax/chapter-option?novelId=' + id;

    const data = await fetch(chapterListUrl);
    const chapters = await data.text();

    loadedCheerio = cheerio.load(chapters);

    let novelChapters = [];

    loadedCheerio('select > option').each(function () {
      let chapterName = loadedCheerio(this).text();
      let releaseDate = null;
      let chapterUrl = loadedCheerio(this).attr('value');

      if (chapterUrl) {
        novelChapters.push({
          chapterName,
          releaseDate,
          chapterUrl,
        });
      }
    });

    return novelChapters;
  };

  if (novelId) {
    novel.chapters = await getChapters(novelId);
  }

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${chapterUrl}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.chr-text').text();

  let chapterText = loadedCheerio('#chr-content').html();
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
  const url = searchUrl + '?keyword=' + searchTerm;
  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.col-novel-main > div.list-novel > .row').each(function () {
    const novelUrl = loadedCheerio(this)
      .find('h3.novel-title > a')
      .attr('href');

    const novelName = loadedCheerio(this).find('h3.novel-title > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    if (novelUrl) {
      novels.push({
        sourceId,
        novelUrl,
        novelName,
        novelCover,
      });
    }
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
