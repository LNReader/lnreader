import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';
import {
  SourceChapter,
  SourceChapterItem,
  SourceNovel,
  SourceNovelItem,
} from '../types';

const sourceId = 163;
const sourceName = 'novelsOnline';

const baseUrl = 'https://novelsonline.net';

const searchNovels = async (searchTerm: string) => {
  const result = await fetchHtml({
    sourceId,
    url: 'https://novelsonline.net/sResults.php',
    init: {
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'pl,en-US;q=0.7,en;q=0.3',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      body: 'q=' + encodeURIComponent(searchTerm),
    },
  });
  let $ = cheerio.load(result);

  const headers = $('li');
  return headers
    .map((i, h) => {
      const novelName = $(h).text();
      const novelUrl = $(h).find('a').attr('href');
      const novelCover = $(h).find('img').attr('src');

      if (!novelUrl) {
        return null;
      }

      return {
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      } as SourceNovelItem;
    })
    .get()
    .filter(sr => sr !== null);
};

const parseNovelAndChapters = async (novelUrl: string) => {
  let novel: SourceNovel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
    chapters: [],
  };

  const result = await fetchHtml({ url: novelUrl });
  let $ = cheerio.load(result);

  novel.novelName = $('h1').text();
  novel.novelCover = $('.novel-cover').find('a > img').attr('src');
  novel.author = $(
    'div.novel-details > div:nth-child(5) > div.novel-detail-body',
  )
    .find('li')
    .map((_, el) => $(el).text())
    .get()
    .join(', ');

  novel.genre = $(
    'div.novel-details > div:nth-child(2) > div.novel-detail-body',
  )
    .find('li')
    .map((_, el) => $(el).text())
    .get()
    .join(',');

  novel.summary = $(
    'div.novel-right > div > div:nth-child(1) > div.novel-detail-body',
  ).text();

  novel.chapters = $('ul.chapter-chs > li > a')
    .map((_, el) => {
      const chapterUrl = $(el).attr('href');
      const chapterName = $(el).text();

      return {
        sourceId,
        chapterName,
        releaseDate: null,
        chapterUrl,
      } as SourceChapterItem;
    })
    .get();

  return novel;
};

const popularNovels = async (page: number) => {
  const url = `${baseUrl}/top-novel/${page}`;
  const result = await fetchHtml({ sourceId, url });
  let $ = cheerio.load(result);

  const headers = $('div.top-novel-block');
  return headers
    .map((i, h) => {
      const novelName = $(h).find('h2').text();
      const novelUrl = $(h).find('a').attr('href');
      const novelCover = $(h).find('img').attr('src');

      if (!novelUrl) {
        return null;
      }

      return {
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      } as SourceNovelItem;
    })
    .get()
    .filter(sr => sr !== null);
  //return { novels: [] as SourceNovelItem[] };
};

const NovelsOnlineScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelsOnlineScraper;
