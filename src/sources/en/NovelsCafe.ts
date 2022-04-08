/**
 * Template file for NovelsCafe
 */

import * as cheerio from 'cheerio';
import { isUrlAbsolute } from '../../utils/isAbsoluteUrl';
import {
  SourceChapter,
  SourceChapterItem,
  SourceNovel,
  SourceNovelItem,
} from '../types';

const sourceId = 113;
const sourceName = 'NovelsCafe';
const baseUrl = 'https://novelscafe.com';

const popularNovels = async (page: number) => {
  const totalPages = 14;
  const url = `${baseUrl}/completed-novel/page/${page}/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels: SourceNovelItem[] = [];

  loadedCheerio('.posts.row .post-column').each(function () {
    let novelUrl = loadedCheerio(this).find('a').attr('href');

    if (novelUrl && !isUrlAbsolute(novelUrl)) {
      novelUrl = baseUrl + novelUrl;
    }

    if (novelUrl) {
      const novelName = loadedCheerio(this).find('.post-title').text().trim();
      let novelCover = loadedCheerio(this).find('img').attr('src');

      if (novelCover && !isUrlAbsolute(novelCover)) {
        novelCover = baseUrl + novelCover;
      }

      const novel = {
        sourceId,
        novelUrl,
        novelName,
        novelCover,
      };

      novels.push(novel);
    }
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl: string) => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const novel: SourceNovel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
    chapters: [],
  };

  novel.novelName = loadedCheerio('h1').text();

  let novelCover = loadedCheerio(
    '#primary > div.row.mt-5 > div.info-wrapper.d-flex.col-12.col-md-9.pt-5.mb-5 > div.col-12.col-md-4.pb-5 > img',
  ).attr('src');

  novel.novelCover = novelCover
    ? isUrlAbsolute(novelCover)
      ? novelCover
      : baseUrl + novelCover
    : undefined;

  novel.summary = loadedCheerio('#description p').text().trim();

  novel.author = loadedCheerio(
    '#primary > div.row.mt-5 > div.info-wrapper.d-flex.col-12.col-md-9.pt-5.mb-5 > div.col-12.col-md-8.mt-1.pb-5 > div:nth-child(3) > div > h2 > a',
  )
    .text()
    .trim();

  novel.genre = loadedCheerio(
    '#primary > div.row.mt-5 > div.info-wrapper.d-flex.col-12.col-md-9.pt-5.mb-5 > div.col-12.col-md-8.mt-1.pb-5 > div:nth-child(6) h2',
  )
    .text()
    .trim()
    .replace(/[\t\n ]+/g, ',');

  novel.status = loadedCheerio(
    '#primary > div.row.mt-5 > div.info-wrapper.d-flex.col-12.col-md-9.pt-5.mb-5 > div.col-12.col-md-8.mt-1.pb-5 > div.counting-header > span:nth-child(4) > strong',
  )
    .text()
    .trim();

  loadedCheerio('.row .text-truncate').each(function () {
    let chapterUrl = loadedCheerio(this).find('a').attr('href');

    if (chapterUrl && !isUrlAbsolute(chapterUrl)) {
      chapterUrl = baseUrl + chapterUrl;
    }

    if (chapterUrl) {
      const chapterName = loadedCheerio(this)
        .find('.chapter-title')
        .text()
        .trim();
      const releaseDate = null;

      const chapter: SourceChapterItem = {
        chapterName,
        releaseDate,
        chapterUrl,
      };

      novel.chapters?.push(chapter);
    }
  });

  return novel;
};

const parseChapter = async (novelUrl: string, chapterUrl: string) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1').text();
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
  const url = `${baseUrl}/?s=${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels: SourceNovelItem[] = [];

  loadedCheerio('.posts.row .post-column').each(function () {
    const novelUrl = loadedCheerio(this).find('a').attr('href');
    if (novelUrl) {
      const novelName = loadedCheerio(this).find('.post-title').text();
      let novelCover = loadedCheerio(this).find('img').attr('src');

      if (novelCover && !isUrlAbsolute(novelCover)) {
        novelCover = baseUrl + novelCover;
      }

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

const NovelsCafeScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelsCafeScraper;
