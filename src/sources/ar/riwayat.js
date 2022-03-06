import * as cheerio from 'cheerio';
import { Status } from '../helpers/constants';

const sourceId = 85;
const sourceName = 'NovelSpace';

const baseUrl = 'https://riwyat.com/';

const popularNovels = async page => {
  const totalPages = 10;
  const url = baseUrl + 'novel/page/' + page;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.page-item-detail').each(function () {
    const novelName = loadedCheerio(this).find('.h5 > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    let novelUrl = loadedCheerio(this)
      .find('.h5 > a')
      .attr('href')
      .split('/')[4];

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
  const url = `${baseUrl}novel/${novelUrl}`;

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
    status: Status.UNKNOWN,
    genre: '',
    summary: '',
    chapters: [],
  };

  novel.novelName = loadedCheerio('.post-title > h1').text().trim();
  novel.novelCover = loadedCheerio('.summary_image').find('img').attr('src');
  novel.summary = loadedCheerio('#tab-manga-about').text()?.trim();
  novel.genre = loadedCheerio('.genres').text()?.trim();
  novel.status =
    loadedCheerio('.status > .value').text()?.trim() === 'مستمرة'
      ? Status.ONGOING
      : Status.UNKNOWN;

  let novelChapters = [];

  const data = await fetch(`${url}/ajax/chapters/`, { method: 'POST' });
  const text = await data.text();

  loadedCheerio = cheerio.load(text);

  loadedCheerio('.wp-manga-chapter').each(function () {
    const chapterName = loadedCheerio(this).find('a').text().trim();
    const releaseDate = loadedCheerio(this).find('span').text().trim();

    let chapterUrl = loadedCheerio(this).find('a').attr('href').split('/');

    chapterUrl[6]
      ? (chapterUrl = chapterUrl[5] + '/' + chapterUrl[6])
      : (chapterUrl = chapterUrl[5]);

    novelChapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}novel/${novelUrl}/${chapterUrl}/`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1#chapter-heading').text();
  const chapterText = loadedCheerio('.reading-content').html();

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
  const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.c-tabs-item__content').each(function () {
    const novelName = loadedCheerio(this).find('.h4 > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    let novelUrl = loadedCheerio(this)
      .find('.h4 > a')
      .attr('href')
      .split('/')[4];

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

const RiwayatScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default RiwayatScraper;
