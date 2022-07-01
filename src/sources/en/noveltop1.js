import * as cheerio from 'cheerio';
import { Status } from '../helpers/constants';

const sourceId = 128;
const sourceName = 'NovelTop1';

const baseUrl = 'https://noveltop1.com';

const popularNovels = async page => {
  let url = baseUrl + '/sort/popular-novels/?page=' + page;
  const result = await fetch(url);
  let body = await result.text();
  const loadedCheerio = cheerio.load(body);
  let novels = [];

  loadedCheerio(
    'div[class="list list-novel col-xs-12"] > div[class="row"]',
  ).each(function () {
    const novelName = loadedCheerio(this)
      .find('h3[class="novel-title"] > a')
      .attr('title');
    const novelCover = loadedCheerio(this)
      .find('img[class="cover"]')
      .attr('src')
      .replace('/novel_200_89/', '/novel/');
    const novelUrl = loadedCheerio(this)
      .find('h3[class="novel-title"] > a')
      .attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };
    novels.push(novel);
  });
  let totalPages = 100;

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const result = await fetch(novelUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);
  let novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
  };

  novel.novelName = loadedCheerio('meta[property="og:novel:novel_name"]')
    .attr('content')
    .trim();

  novel.novelCover = loadedCheerio('meta[itemprop="image"]').attr('content');
  novel.summary = loadedCheerio('.desc-text').text();
  novel.author = loadedCheerio('meta[property="og:novel:author"]').attr(
    'content',
  );
  novel.genre = loadedCheerio('meta[property="og:novel:genre"]').attr(
    'content',
  );

  novel.status =
    loadedCheerio('meta[property="og:novel:status"]').attr('content') ===
    'OnGoing'
      ? Status.ONGOING
      : Status.COMPLETED;

  let id = loadedCheerio('div[data-novel-id]').attr('data-novel-id');
  const chaptersRaw = await fetch(
    baseUrl + '/ajax/chapter-archive?novelId=' + id,
  );
  const chaptersTxt = await chaptersRaw.text();
  const loadedCheerio2 = cheerio.load(chaptersTxt);
  const chapters = [];

  loadedCheerio2('div[class="panel-body"] li > a').each(function () {
    const chapterName = loadedCheerio2(this).attr('title');
    const releaseDate = null;
    const chapterUrl = loadedCheerio2(this).attr('href');

    chapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = chapters;
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(chapterUrl);
  const body = await result.text();
  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.chr-text').text();
  const chapterText = loadedCheerio('#chr-content').html();

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName: chapterName,
    chapterText: chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const result = await fetch(`${baseUrl}/search?keyword=${searchTerm}`);
  let body = await result.text();
  const loadedCheerio = cheerio.load(body);

  let novels = [];
  loadedCheerio(
    'div[class="list list-novel col-xs-12"] > div[class="row"]',
  ).each(function () {
    const novelName = loadedCheerio(this)
      .find('h3[class="novel-title"] > a')
      .attr('title');
    const novelCover = loadedCheerio(this)
      .find('img[class="cover"]')
      .attr('src')
      .replace('/novel_200_89/', '/novel/');
    const novelUrl = loadedCheerio(this)
      .find('h3[class="novel-title"] > a')
      .attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };
    novels.push(novel);
  });

  return novels;
};

const NovelTop1Scraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelTop1Scraper;
