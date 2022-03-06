import cheerio from 'react-native-cheerio';
import { Status } from '../helpers/constants';

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

  loadedCheerio('.entry-content .wpp_col').each(function () {
    const novelName = loadedCheerio(this).find('h3').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this).find('h3 > a').attr('href');

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

  novel.novelName = loadedCheerio('.entry-title').text().trim();

  novel.novelCover = loadedCheerio('.lightnovel-thumb img').attr('src');

  novel.summary = loadedCheerio('.lightnovel-synopsis p').text().trim();

  const statusSelector = loadedCheerio('div.lightnovel-info > p:nth-child(4)')
    .text()
    ?.replace('Status :', '')
    .trim();

  novel.status =
    statusSelector === 'Aktif'
      ? Status.ONGOING
      : statusSelector === 'Tamat'
      ? Status.COMPLETED
      : Status.UNKNOWN;

  novel.genre = loadedCheerio('div.lightnovel-info > p:nth-child(5)')
    .text()
    ?.replace('Genres :', '')
    .trim();

  let chapters = [];

  loadedCheerio('.lightnovel-episode li').each(function () {
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

  const chapterName = loadedCheerio('.entry-title').text();
  const chapterText = loadedCheerio('.123').html();

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

  loadedCheerio('.entry-content .wpp_col').each(function () {
    const novelName = loadedCheerio(this).find('h3').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this).find('h3 > a').attr('href');

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
