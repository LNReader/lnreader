import * as cheerio from 'cheerio';
import { isUrlAbsolute } from '../../utils/isAbsoluteUrl';
import {
  SourceChapter,
  SourceChapterItem,
  SourceNovel,
  SourceNovelItem,
} from '../types';

const sourceId = 115;
const sourceName = 'HakoLightNovel';
const baseUrl = 'https://ln.hako.re';

const popularNovels = async (page: number) => {
  const totalPages = 49;
  const url = `${baseUrl}/danh-sach?page=${page}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels: SourceNovelItem[] = [];

  loadedCheerio('main.row > .thumb-item-flow').each(function () {
    let novelUrl = loadedCheerio(this)
      .find('div.thumb_attr.series-title > a')
      .attr('href');

    if (novelUrl && !isUrlAbsolute(novelUrl)) {
      novelUrl = baseUrl + novelUrl;
    }

    if (novelUrl) {
      const novelName = loadedCheerio(this).find('.series-title').text().trim();
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

  novel.novelName = loadedCheerio('.series-name').text();

  let novelCover = loadedCheerio('.img > img').attr('src');

  novel.novelCover = novelCover
    ? isUrlAbsolute(novelCover)
      ? novelCover
      : baseUrl + novelCover
    : undefined;

  novel.summary = loadedCheerio('.summary-content').text().trim();

  novel.author = loadedCheerio(
    '#mainpart > div:nth-child(2) > div > div:nth-child(1) > section > main > div.top-part > div > div.col-12.col-md-9 > div.series-information > div:nth-child(2) > span.info-value > a',
  )
    .text()
    .trim();

  novel.genre = loadedCheerio('.series-gernes')
    .text()
    .trim()
    .replace(/[\t\n ]+/g, ',');

  novel.status = loadedCheerio(
    '#mainpart > div:nth-child(2) > div > div:nth-child(1) > section > main > div.top-part > div > div.col-12.col-md-9 > div.series-information > div:nth-child(4) > span.info-value > a',
  )
    .text()
    .trim();

  loadedCheerio('.list-chapters li').each(function () {
    let chapterUrl = loadedCheerio(this).find('a').attr('href');

    if (chapterUrl && !isUrlAbsolute(chapterUrl)) {
      chapterUrl = baseUrl + chapterUrl;
    }

    if (chapterUrl) {
      const chapterName = loadedCheerio(this)
        .find('.chapter-name')
        .text()
        .trim();
      const releaseDate = loadedCheerio(this).find('.chapter-time').text();

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

  const chapterName = loadedCheerio('.title-item').text();
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
  const url = `${baseUrl}/tim-kiem?keywords=${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels: SourceNovelItem[] = [];

  loadedCheerio('div.row > .thumb-item-flow').each(function () {
    let novelUrl = loadedCheerio(this)
      .find('div.thumb_attr.series-title > a')
      .attr('href');

    if (novelUrl && !isUrlAbsolute(novelUrl)) {
      novelUrl = baseUrl + novelUrl;
    }

    if (novelUrl) {
      const novelName = loadedCheerio(this).find('.series-title').text();
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

const HakoLightNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default HakoLightNovelScraper;
