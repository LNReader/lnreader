import * as cheerio from 'cheerio';
import { isUrlAbsolute } from '../../utils/isAbsoluteUrl';
import {
  SourceChapter,
  SourceChapterItem,
  SourceNovel,
  SourceNovelItem,
} from '../types';

const sourceId = 114;
const sourceName = 'LightNovelReader';
const baseUrl = 'https://lightnovelreader.org';

const popularNovels = async (page: number) => {
  const url = `${baseUrl}/ranking/top-rated/${page}/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels: SourceNovelItem[] = [];

  loadedCheerio('.category-items.ranking-category.cm-list > ul > li').each(
    function () {
      let novelUrl = loadedCheerio(this).find('a').attr('href');

      if (novelUrl && !isUrlAbsolute(novelUrl)) {
        novelUrl = baseUrl + novelUrl;
      }

      if (novelUrl) {
        const novelName = loadedCheerio(this)
          .find('.category-name a')
          .text()
          .trim();
        let novelCover = loadedCheerio(this)
          .find('.category-img img')
          .attr('src');

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
    },
  );

  return { novels };
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

  novel.novelName = loadedCheerio('.section-header-title > h2').text();

  let novelCover = loadedCheerio('.novels-detail img').attr('src');

  novel.novelCover = novelCover
    ? isUrlAbsolute(novelCover)
      ? novelCover
      : baseUrl + novelCover
    : undefined;

  novel.summary = loadedCheerio(
    'div.container > div > div.col-12.col-xl-9 > div > div:nth-child(5) > div',
  )
    .text()
    .trim();

  novel.author = loadedCheerio(
    'div.novels-detail-right > ul > li:nth-child(6) > .novels-detail-right-in-right > a',
  )
    .text()
    .trim();

  novel.genre = loadedCheerio(
    'body > section:nth-child(4) > div > div > div.col-12.col-xl-9 > div > div:nth-child(2) > div > div.novels-detail-right > ul > li:nth-child(3) > div.novels-detail-right-in-right',
  )
    .text()
    .trim()
    .replace(/[\t\n ]+/g, ',');

  novel.status = loadedCheerio(
    'div.novels-detail-right > ul > li:nth-child(2) > .novels-detail-right-in-right',
  )
    .text()
    .trim();

  loadedCheerio('.cm-tabs-content > ul > li').each(function () {
    let chapterUrl = loadedCheerio(this).find('a').attr('href');

    if (chapterUrl && !isUrlAbsolute(chapterUrl)) {
      chapterUrl = baseUrl + chapterUrl;
    }

    if (chapterUrl) {
      const chapterName = loadedCheerio(this).find('a').text().trim();
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

  const chapterName = loadedCheerio('.section-header-title h2').text();
  const chapterText = loadedCheerio('#chapterText').html() || '';

  const chapter: SourceChapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

interface searchData {
  overview: string;
  original_title: string;
  link: string;
  image: string;
}

const searchNovels = async (searchTerm: string) => {
  const url = `${baseUrl}/search/autocomplete?dataType=json&query=${searchTerm}`;

  const result = await fetch(url, { method: 'POST' });
  const body = await result.json();
  const data: searchData[] = body.results;

  const novels: SourceNovelItem[] = [];

  data.forEach(item => {
    let novelUrl = item.link;
    let novelName = item.original_title
      .replace(/&#8220;|&#8221;/g, '"')
      .replace(/&#[0-9]*;/g, ' ');
    let novelCover = item.image;

    novels.push({
      sourceId,
      novelUrl,
      novelName,
      novelCover,
    });
  });

  return novels;
};

const LightNovelReaderScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default LightNovelReaderScraper;
