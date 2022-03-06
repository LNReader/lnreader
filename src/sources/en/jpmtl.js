import * as cheerio from 'cheerio';
const baseUrl = 'https://jpmtl.com/';

const popularNovels = async page => {
  let totalPages = 157;
  let url =
    'https://jpmtl.com/v2/book/show/browse?query=&categories=&content_type=0&direction=0&page=' +
    page +
    '&limit=20&type=5&status=all&language=3&exclude_categories=';

  const result = await fetch(url);
  const body = await result.json();

  let novels = [];

  body.map(item => {
    const novelName = item.title;
    const novelCover = item.cover;
    const novelUrl = item.id + '/';

    const novel = { sourceId: 14, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}books/${novelUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 14;

  novel.sourceName = 'JPMTL';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('h1.book-sidebar__title').text();

  novel.novelCover = loadedCheerio('.book-sidebar').find('img').attr('src');

  loadedCheerio('.post-content_item').each(function () {
    const detailName = loadedCheerio(this)
      .find('.summary-heading > h5')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();
    const detail = loadedCheerio(this)
      .find('.summary-content')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();

    novel[detailName] = detail;
  });

  novel.summary = loadedCheerio('.main-book__synopsis').text();

  novel.genre = '';

  loadedCheerio('a.main-book__category').each(function () {
    novel.genre += loadedCheerio(this).text();
  });

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const info = loadedCheerio('.book-sidebar__author > .book-sidebar__info')
    .text()
    .trim()
    .split('・');

  if (info) {
    novel.author = info[0];

    novel.status = capitalizeFirstLetter(info[1]);
  }

  let novelChapters = [];

  const chapterListUrl = `https://jpmtl.com/v2/chapter/${novelUrl}/list?state=published&structured=true&d`;

  const chapterResult = await fetch(chapterListUrl);
  const volumes = await chapterResult.json();

  volumes.map(volume => {
    volume.chapters.map(chapter => {
      const chapterName = chapter.title;
      const releaseDate = chapter.created_at;
      const chapterUrl = chapter.id;

      const obj = {
        sourceId: 14,
        chapterName,
        releaseDate,
        chapterUrl,
      };

      novelChapters.push(obj);
    });
  });

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}books/${novelUrl}${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.chapter-content__title').text();
  let chapterText = loadedCheerio('.chapter-content__content').html();
  novelUrl += '/';

  const chapter = {
    sourceId: 14,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `https://jpmtl.com/v2/book/show/browse?query=${searchTerm}&categories=&content_type=2&direction=0&page=1&limit=20&type=5&status=all&language=3&exclude_categories=`;

  const result = await fetch(url);
  const body = await result.json();

  const novels = [];

  body.map(item => {
    const novelName = item.title;
    const novelCover = item.cover;
    const novelUrl = item.id + '/';

    const novel = { sourceId: 14, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return novels;
};

const JPMTLScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default JPMTLScraper;
