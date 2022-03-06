import * as cheerio from 'cheerio';
const sourceId = 88;
const sourceName = 'Chireads';

const baseUrl = 'https://chireads.com/';

const popularNovels = async page => {
  const totalPages = 2;
  const url = `${baseUrl}category/translatedtales/page/${page}/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('#content li').each(function () {
    const novelName = loadedCheerio(this).find('.news-list-tit h5').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this)
      .find('.news-list-tit h5 a')
      .attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
    novelName: '',
    novelCover: '',
    author: '',
    status: '',
    genre: '',
    summary: '',
    chapters: [],
  };

  novel.novelName = loadedCheerio('.inform-title').text().trim();

  novel.novelCover = loadedCheerio('.inform-product img').attr('src');

  novel.summary = loadedCheerio('.inform-inform-txt').text().trim();

  let chapters = [];

  loadedCheerio('.chapitre-table a').each(function () {
    const chapterName = loadedCheerio(this).text().trim();
    const releaseDate = null;
    const chapterUrl = loadedCheerio(this).attr('href');

    chapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = chapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.article-title').text();
  const chapterText = loadedCheerio('#content').html();

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
  const url = `${baseUrl}search?x=0&y=0&name=${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('#content li').each(function () {
    const novelName = loadedCheerio(this).find('.news-list-tit h5').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this)
      .find('.news-list-tit h5 a')
      .attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return novels;
};

const ChireadsScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default ChireadsScraper;
