import * as cheerio from 'cheerio';
const sourceId = 97;
const sourceName = 'NovelFull.me';

const baseUrl = 'https://novelfull.me/';

const popularNovels = async page => {
  const totalPages = 25;
  const url = `${baseUrl}popular?page=${page}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.book-item').each(function () {
    const novelName = loadedCheerio(this).find('.title').text();
    const novelCover =
      'https:' + loadedCheerio(this).find('img').attr('data-src');
    const novelUrl =
      baseUrl + loadedCheerio(this).find('.title a').attr('href').substring(1);

    const novel = { sourceId, novelName, novelCover, novelUrl };

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
    novelName: '',
    novelCover: '',
    author: '',
    status: '',
    genre: '',
    summary: '',
    chapters: [],
  };

  novel.novelName = loadedCheerio('.name h1').text().trim();

  novel.novelCover =
    'https:' + loadedCheerio('.img-cover img').attr('data-src');

  novel.summary = loadedCheerio(
    'body > div.layout > div.main-container.book-details > div > div.row.no-gutters > div.col-lg-8 > div.mt-1 > div.section.box.mt-1.summary > div.section-body > p.content',
  )
    .text()
    .trim();

  novel.author = loadedCheerio(
    'body > div.layout > div.main-container.book-details > div > div.row.no-gutters > div.col-lg-8 > div.book-info > div.detail > div.meta.box.mt-1.p-10 > p:nth-child(1) > a > span',
  )
    .text()
    ?.trim();

  novel.status = loadedCheerio(
    'body > div.layout > div.main-container.book-details > div > div.row.no-gutters > div.col-lg-8 > div.book-info > div.detail > div.meta.box.mt-1.p-10 > p:nth-child(2) > a > span',
  )
    .text()
    ?.trim();

  novel.genre = loadedCheerio(
    'body > div.layout > div.main-container.book-details > div > div.row.no-gutters > div.col-lg-8 > div.book-info > div.detail > div.meta.box.mt-1.p-10 > p:nth-child(3)',
  )
    .text()
    ?.replace('Genres :', '')
    .replace(/[\s\n]+/g, ' ')
    .trim();

  let chapters = [];

  const chaptersUrl =
    novelUrl.replace(baseUrl, 'https://novelfull.me/api/novels/') +
    '/chapters?source=detail';

  const chaptersRequest = await fetch(chaptersUrl);
  const chaptersHtml = await chaptersRequest.text();

  loadedCheerio = cheerio.load(chaptersHtml);

  loadedCheerio('li').each(function () {
    const chapterName = loadedCheerio(this)
      .find('.chapter-title')
      .text()
      .trim();

    const releaseDate = loadedCheerio(this)
      .find('.chapter-update')
      .text()
      .trim();

    const chapterUrl =
      baseUrl + loadedCheerio(this).find('a').attr('href').substring(1);

    chapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = chapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  loadedCheerio('#listen-chapter').remove();
  loadedCheerio('#google_translate_element').remove();

  const chapterName = loadedCheerio('#chapter__content > h1').text();
  const chapterText = loadedCheerio('.chapter__content').html();

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
  const url = `${baseUrl}search?q=${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.book-item').each(function () {
    const novelName = loadedCheerio(this).find('.title').text();
    const novelCover =
      'https:' + loadedCheerio(this).find('img').attr('data-src');
    const novelUrl =
      baseUrl + loadedCheerio(this).find('.title a').attr('href').substring(1);

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return novels;
};

const NovelFullMeScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelFullMeScraper;
