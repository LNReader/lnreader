import * as cheerio from 'cheerio';
import { Status } from '../helpers/constants';

const sourceId = 83;
const sourceName = 'MyLoveNovel';

const baseUrl = 'https://m.mylovenovel.com/';

const popularNovels = async page => {
  const totalPages = 909;
  const url = `${baseUrl}search----${page}.html`;
  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.list > li').each(function () {
    const novelName = loadedCheerio(this).find('.bookname').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl =
      baseUrl.slice(0, -1) + loadedCheerio(this).find('a').attr('href');

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
    chapters: [],
  };

  novel.novelName = loadedCheerio('p.booktitle').text().trim();

  novel.novelCover = loadedCheerio('img.bookimg').attr('src');

  novel.summary = loadedCheerio('meta[name="description"]')
    .attr('content')
    .trim();

  novel.author = loadedCheerio('#info > div.main > div.detail > p:nth-child(3)')
    .text()
    ?.replace('Author：', '')
    .trim();

  loadedCheerio('#morelist > ul > li').each(function () {
    const chapterName = loadedCheerio(this).find('a').text().trim();
    const releaseDate = null;
    const chapterUrl =
      baseUrl.slice(0, -1) + loadedCheerio(this).find('a').attr('href');

    novel.chapters.push({ chapterName, releaseDate, chapterUrl });
  });

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.headline').text();
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
  const url = `${baseUrl}index.php?s=so&module=book&keyword=${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.list > li').each(function () {
    const novelName = loadedCheerio(this).find('.bookname').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl =
      baseUrl.slice(0, -1) + loadedCheerio(this).find('a').attr('href');

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

const MyLoveNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default MyLoveNovelScraper;
