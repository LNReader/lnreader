import * as cheerio from 'cheerio';
import dayjs from 'dayjs';

const sourceId = 27;

const sourceName = 'Comrade Mao';

const baseUrl = 'https://comrademao.com/';

const popularNovels = async page => {
  let url = baseUrl + 'page/' + page + '/?post_type=novel';

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.listupd')
    .find('div.bs')
    .each(function () {
      const novelName = loadedCheerio(this).find('.tt').text().trim();
      const novelCover = loadedCheerio(this).find('img').attr('src');
      const novelUrl = loadedCheerio(this).find('a').attr('href');

      const novel = {
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel = { sourceId, sourceName, url, novelUrl };

  novel.novelName = loadedCheerio('.entry-title').text().trim();

  novel.novelCover = loadedCheerio('div.thumbook > div > img').attr('src');

  novel.summary = loadedCheerio('div.infox > div:nth-child(6) > span > p')
    .text()
    .trim();

  novel.genre = loadedCheerio('div.infox > div:nth-child(4) > span')
    .text()
    .replace(/\s/g, '');

  novel.status = loadedCheerio('div.infox > div:nth-child(3) > span')
    .text()
    .trim();

  novel.author = loadedCheerio('div.infox > div:nth-child(2) > span')
    .text()
    .trim();

  let novelChapters = [];

  loadedCheerio('#chapterlist')
    .find('li')
    .each(function () {
      const releaseDate = dayjs(
        loadedCheerio(this).find('.chapterdate').text(),
      ).format('LL');
      const chapterName = loadedCheerio(this).find('.chapternum').text();
      const chapterUrl = loadedCheerio(this).find('a').attr('href');

      novelChapters.push({
        chapterName,
        chapterUrl,
        releaseDate,
      });
    });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('.doc_header').text();
  let chapterText = loadedCheerio('#chaptercontent').html();

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
  const url = baseUrl + '?s=' + searchTerm + '&post_type=novel';

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.listupd')
    .find('div.bs')
    .each(function () {
      const novelName = loadedCheerio(this).find('.tt').text().trim();
      const novelCover = loadedCheerio(this).find('img').attr('src');
      const novelUrl = loadedCheerio(this).find('a').attr('href');

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

const ComradeMaoScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default ComradeMaoScraper;
