import * as cheerio from 'cheerio';
import {
  SourceChapter,
  SourceChapterItem,
  SourceNovel,
  SourceNovelItem,
} from '../types';

const sourceId = 108;
const sourceName = 'NovelUpdatesCC';
const baseUrl = 'https://www.novelupdates.cc';

const popularNovels = async (page: number) => {
  let totalPages = 61;
  const url = `${baseUrl}/hot-novel/${page}.html`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels: SourceNovelItem[] = [];

  loadedCheerio('.list-truyen .row').each(function () {
    const novelName = loadedCheerio(this).find('h3.truyen-title > a').text();
    const novelCover = loadedCheerio(this).find('img.cover').attr('src');
    const novelUrl =
      baseUrl + loadedCheerio(this).find('h3.truyen-title > a').attr('href');

    const novel = {
      sourceId,
      novelUrl,
      novelName,
      novelCover,
    };

    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl: string) => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel: SourceNovel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
  };

  novel.novelName = loadedCheerio('h3.title').text().trim();

  novel.novelCover = loadedCheerio('img.cover').attr('src');

  novel.summary = loadedCheerio('div.desc-text').text().trim();

  novel.author = loadedCheerio('div.info > div > h3')
    .filter(function () {
      return loadedCheerio(this).text().trim() === 'Author:';
    })
    .siblings()
    .text();

  novel.genre = loadedCheerio('div.info > div')
    .filter(function () {
      return loadedCheerio(this).find('h3').text().trim() === 'Genre:';
    })
    .text()
    .replace('Genre:', '');

  novel.status = loadedCheerio('div.info > div > h3')
    .filter(function () {
      return loadedCheerio(this).text().trim() === 'Status:';
    })
    .next()
    .text();

  const novelId = loadedCheerio('#rating').attr('data-novel-id');

  const getChapters = async (id: string) => {
    const chapterListUrl = baseUrl + '/ajax/chapter-option?novelId=' + id;

    const data = await fetch(chapterListUrl);
    const chapters = await data.text();

    loadedCheerio = cheerio.load(chapters);

    let novelChapters: SourceChapterItem[] = [];

    loadedCheerio('select > option').each(function () {
      let chapterName = loadedCheerio(this).text();
      let releaseDate = null;
      let chapterUrl = loadedCheerio(this)
        .attr('value')
        ?.replace(`/${novelUrl}`, '');

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

const parseChapter = async (novelUrl: string, chapterUrl: string) => {
  const url = baseUrl + chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.chapter-title').attr('title');
  const chapterText = loadedCheerio('#chapter-content').html() || '';

  const chapter: SourceChapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async (searchTerm: string) => {
  const url = `${baseUrl}/search?keyword=${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels: SourceNovelItem[] = [];

  loadedCheerio('div.col-truyen-main > div.list-truyen > .row').each(
    function () {
      const novelUrl =
        baseUrl + loadedCheerio(this).find('h3.truyen-title > a').attr('href');

      const novelName = loadedCheerio(this).find('h3.truyen-title > a').text();
      const novelCover = baseUrl + loadedCheerio(this).find('img').attr('src');

      if (novelUrl) {
        novels.push({
          sourceId,
          novelUrl,
          novelName,
          novelCover,
        });
      }
    },
  );

  return novels;
};

const NovelUpdatesCCScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelUpdatesCCScraper;
