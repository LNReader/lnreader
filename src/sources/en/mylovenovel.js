import * as cheerio from 'cheerio';
import { Status } from '../helpers/constants';

const sourceId = 83;
const sourceName = 'MyLoveNovel';

const baseUrl = 'https://m.mylovenovel.com/';

const popularNovels = async page => {
  const url = `${baseUrl}all-${page}.html`;
  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('#article_list_content > li').each(function () {
    const novelName = loadedCheerio(this).find('h3').text();
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

  return { novels };
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

  novel.novelCover = loadedCheerio('div.bookimg2 > img').attr('src');

  novel.summary = loadedCheerio('meta[name="description"]')
    .attr('content')
    .trim();

  novel.author = loadedCheerio('.booknav2 > :nth-child(2)')
    .text()
    ?.replace('Author：', '')
    .trim();

  novel.status = loadedCheerio('.booknav2 > :nth-child(5)')
    .text()
    ?.replace('Status：', '')
    .trim();

  novel.genre = loadedCheerio('.booknav2 > :nth-child(4)')
    .text()
    ?.replace('Genre：', '')
    .trim();

  loadedCheerio('ul.chapterlist > li').each(function () {
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

  const chapterName = loadedCheerio('h1.hide720').text();
  const chapterText = loadedCheerio('.content').html();

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

  loadedCheerio('#article_list_content > li').each(function () {
    const novelName = loadedCheerio(this).find('h3 > a').text();
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
