import * as cheerio from 'cheerio';

const sourceId = 87;
const sourceName = 'IndoWebNovel';

const baseUrl = 'http://indowebnovel.id/';

const popularNovels = async page => {
  const totalPages = 1;
  const url = `${baseUrl}daftar-novel/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.novellist-blc li').each(function () {
    const novelName = loadedCheerio(this).find('a').text();
    const novelCover = null;
    const novelUrl = loadedCheerio(this).find('a').attr('href');

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

  novel.novelName = loadedCheerio('.series-title').text().trim();

  novel.novelCover = loadedCheerio('.series-thumb > img').attr('src');

  novel.summary = loadedCheerio('.series-synops').text().trim();

  novel.status = loadedCheerio('.status').text().trim();

  novel.genre = [];

  loadedCheerio('.series-genres').each(function () {
    novel.genre.push(loadedCheerio(this).find('a').text().trim());
  });

  novel.genre = novel.genre.toString();

  let chapters = [];

  loadedCheerio('.series-chapterlist li').each(function () {
    const chapterName = loadedCheerio(this).find('a').text().trim();
    const releaseDate = null;
    const chapterUrl = loadedCheerio(this).find('a').attr('href');

    chapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = chapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.title-chapter').text();
  const chapterText = loadedCheerio('.reader').html();

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
  const url = `${baseUrl}daftar-novel/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.novellist-blc li').each(function () {
    const novelName = loadedCheerio(this).find('a').text();
    const novelCover = null;
    const novelUrl = loadedCheerio(this).find('a').attr('href');

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    if (novelName.toLowerCase().includes(searchTerm.toLowerCase())) {
      novels.push(novel);
    }
  });

  return novels;
};

const IndoWebNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default IndoWebNovelScraper;
