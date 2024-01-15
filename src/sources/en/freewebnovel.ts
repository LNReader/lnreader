import { Status } from '../helpers/constants';
import * as cheerio from 'cheerio';
import {
  SourceChapter,
  SourceChapterItem,
  SourceNovel,
  SourceNovelItem,
} from '../types';

const sourceId = 13;
const sourceName = 'FreeWebNovel';
const baseUrl = 'https://freewebnovel.com';

const popularNovels = async (page: number, { showLatestNovels }) => {
  const sort = showLatestNovels
    ? '/latest-release-novels/'
    : '/completed-novels/';

  const result = await fetch(baseUrl + sort + page).then(res => res.text());
  const loadedCheerio = cheerio.load(result);

  const novels: SourceNovelItem[] = loadedCheerio('.li-row')
    .map((index, element) => ({
      sourceId,
      novelName: loadedCheerio(element).find('.tit').text(),
      novelCover: loadedCheerio(element).find('img').attr('src'),
      novelUrl: baseUrl + loadedCheerio(element).find('h3 > a').attr('href'),
    }))
    .get();

  return { novels };
};

const parseNovelAndChapters = async (novelUrl: string) => {
  const result = await fetch(novelUrl).then(res => res.text());
  const loadedCheerio = cheerio.load(result);

  const novel: SourceNovel = {
    sourceId,
    sourceName,
    novelUrl,
    url: novelUrl,
    novelName: loadedCheerio('h1.tit').text(),
    novelCover: loadedCheerio('.pic > img').attr('src'),
    summary: loadedCheerio('.inner').text().trim(),
  };

  novel.genre = loadedCheerio('[title=Genre]')
    .next()
    .text()
    .replace(/[\t\n]/g, '');

  novel.author = loadedCheerio('[title=Author]')
    .next()
    .text()
    .replace(/[\t\n]/g, '');

  novel.status =
    loadedCheerio('[title=Status]')
      .next()
      .text()
      .replace(/[\t\n]/g, '') === 'OnGoing'
      ? Status.ONGOING
      : Status.COMPLETED;

  const chapters: SourceChapterItem[] = loadedCheerio('#idData > li > a')
    .map((index, element) => ({
      chapterName: loadedCheerio(element).attr('title') || 'Chapter ' + index,
      releaseDate: null,
      chapterUrl: baseUrl + loadedCheerio(element).attr('href'),
    }))
    .get();

  novel.chapters = chapters;
  return novel;
};

const parseChapter = async (novelUrl: string, chapterUrl: string) => {
  const result = await fetch(chapterUrl).then(res => res.text());
  const loadedCheerio = cheerio.load(result);

  const chapter: SourceChapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName: loadedCheerio('h1.tit').text(),
    chapterText: loadedCheerio('div.txt').html(),
  };

  return chapter;
};

const searchNovels = async (searchTerm: string) => {
  const result = await fetch(baseUrl + '/search/', {
    method: 'POST',
    body: 'searchkey=' + encodeURIComponent(searchTerm),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
  }).then(res => res.text());

  const loadedCheerio = cheerio.load(result);
  const novels: SourceNovelItem[] = loadedCheerio('.li-row > .li > .con')
    .map((index, element) => ({
      sourceId,
      novelName: loadedCheerio(element).find('.tit').text(),
      novelCover: loadedCheerio(element).find('.pic > a > img').attr('src'),
      novelUrl: baseUrl + loadedCheerio(element).find('h3 > a').attr('href'),
    }))
    .get();

  return novels;
};

const FreeWebNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default FreeWebNovelScraper;
