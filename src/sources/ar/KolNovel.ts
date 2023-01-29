import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';
import { SourceChapter, SourceNovel, SourceNovelItem } from '../types';

const sourceId = 53;
const sourceName = 'KolNovel';
const baseUrl = 'https://kolnovel.com/';

const popularNovels = async (page: number) => {
  let totalPages = 22;
  const url = `${baseUrl}series/?page=${page}&status=&order=popular`;

  const body = await fetchHtml({ url, sourceId });
  const loadedCheerio = cheerio.load(body);

  let novels: SourceNovelItem[] = [];

  loadedCheerio('article.maindet').each(function () {
    const novelName = loadedCheerio(this).find('h2').text();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');
    const novelUrl = loadedCheerio(this).find('h2 a').attr('href');

    if (novelUrl) {
      novels.push({
        sourceId,
        novelUrl,
        novelName,
        novelCover,
      });
    }
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl: string) => {
  const url = novelUrl;

  const body = await fetchHtml({ url, sourceId });
  const loadedCheerio = cheerio.load(body);

  let novel: SourceNovel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
    chapters: [],
  };

  novel.novelName = loadedCheerio('h1.entry-title').text().trim();

  novel.novelCover = loadedCheerio('div.sertothumb > img').attr('data-src');

  novel.summary = loadedCheerio('div.sersysn').text().trim();

  loadedCheerio('div.sertoauth > .serl').each(function () {
    const detailKey = loadedCheerio(this).find('.sername').text().trim();
    const detailValue = loadedCheerio(this).find('.serval').text().trim();

    switch (detailKey) {
      case 'الكاتب':
        novel.author = detailValue;
        break;
    }
  });

  loadedCheerio('.eplister  li').each(function () {
    const chapterUrl = loadedCheerio(this).find('a').attr('href');

    if (chapterUrl) {
      const chapterNo = loadedCheerio(this).find('.epl-num').text().trim();

      const chapterName =
        chapterNo + ' ' + loadedCheerio(this).find('.epl-title').text().trim();
      const releaseDate = loadedCheerio(this).find('.epl-date').text().trim();

      novel.chapters?.push({
        chapterName,
        releaseDate,
        chapterUrl,
      });
    }
  });

  novel.chapters?.reverse();

  return novel;
};

const parseChapter = async (novelUrl: string, chapterUrl: string) => {
  const url = chapterUrl;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);
  const chapterName = loadedCheerio('.entry-title').text();
  const chapterText = loadedCheerio('.epcontent').html() || '';

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
  const url = `${baseUrl}/?s=${searchTerm}`;

  const body = await fetchHtml({ url, sourceId });
  const loadedCheerio = cheerio.load(body);

  let novels: SourceNovelItem[] = [];

  loadedCheerio('article.maindet').each(function () {
    const novelName = loadedCheerio(this).find('h2').text();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');
    const novelUrl = loadedCheerio(this).find('h2 a').attr('href');

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

const KolNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default KolNovelScraper;
