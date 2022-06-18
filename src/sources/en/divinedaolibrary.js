import * as cheerio from 'cheerio';
import { defaultCoverUri } from '../helpers/constants';

const sourceId = 70;

const sourceName = 'Divine Dao Library';

const baseUrl = 'https://www.divinedaolibrary.com/';

const popularNovels = async page => {
  let url = baseUrl + 'novels';
  const totalPages = 1;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('#main')
    .find('li')
    .each(function () {
      const novelName = loadedCheerio(this).find('a').text();
      const novelCover = null;
      const novelUrl = loadedCheerio(this).find(' a').attr('href');

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

  const loadedCheerio = cheerio.load(body);

  let novel = { sourceId, sourceName, url, novelUrl };

  novel.novelName = loadedCheerio('h1.entry-title').text().trim();

  novel.novelCover =
    loadedCheerio('.entry-content').find('img').attr('src') || defaultCoverUri;

  novel.summary = loadedCheerio('#main > article > div > p:nth-child(6)')
    .text()
    .trim();

  novel.genre = null;

  novel.status = null;

  novel.author = loadedCheerio('#main > article > div > h3:nth-child(2)')
    .text()
    .replace(/Author:/g, '')
    .trim();

  let novelChapters = [];

  loadedCheerio('#main')
    .find('li > span > a')
    .each(function () {
      const chapterName = loadedCheerio(this).text().trim();
      const releaseDate = null;
      const chapterUrl = loadedCheerio(this).attr('href');

      novelChapters.push({ chapterName, releaseDate, chapterUrl });
    });

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('.entry-title').text().trim();

  let chapterText = loadedCheerio('.entry-content').html();

  if (!chapterText) {
    chapterText = loadedCheerio('.page-header').html();
  }

  chapterText = `<p><h1>${chapterName}</h1></p>` + chapterText;

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
  let url = baseUrl + 'novels';

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('#main')
    .find('li')
    .each(function () {
      const novelName = loadedCheerio(this).find('a').text();
      const novelCover = null;
      const novelUrl = loadedCheerio(this).find(' a').attr('href');

      const novel = {
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    });

  novels = novels.filter(novel =>
    novel.novelName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return novels;
};

const DivineDaoLibraryScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default DivineDaoLibraryScraper;
