import * as cheerio from 'cheerio';
const baseUrl = 'http://wuxiaworld.cloud/';

const popularNovels = async page => {
  let totalPages = 41;
  const url = `${baseUrl}/popular-novel?page=${page}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.col-novel-main > div.list-novel > .row').each(function () {
    let novelUrl = loadedCheerio(this)
      .find('h3.novel-title > a')
      .attr('href')
      .replace(baseUrl + 'novel/', '');
    novelUrl = `${novelUrl}/`;

    const novelName = loadedCheerio(this).find('h3.novel-title > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    const novel = {
      sourceId: 20,
      novelUrl,
      novelName,
      novelCover,
    };

    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}novel/${novelUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 20;

  novel.sourceName = 'WuxiaWorld.cloud';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('div.book > img').attr('alt');

  novel.novelCover = loadedCheerio('div.book > img').attr('src');

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
    .replace('Genre:', '')
    .replace(/\s/g, '');

  novel.artist = null;

  novel.status = loadedCheerio('div.info > div')
    .filter(function () {
      return loadedCheerio(this).find('h3').text().trim() === 'Status:';
    })
    .text()
    .replace('Status:', '')
    .replace(/\s/g, '');

  const novelId = loadedCheerio('#rating').attr('data-novel-id');

  const getChapters = async id => {
    const chapterListUrl = baseUrl + 'ajax/chapter-option?novelId=' + id;

    const data = await fetch(chapterListUrl);
    const chapters = await data.text();

    loadedCheerio = cheerio.load(chapters);

    let novelChapters = [];

    loadedCheerio('select > option').each(function () {
      let chapterName = loadedCheerio(this).text();
      let releaseDate = null;
      let chapterUrl = loadedCheerio(this).attr('value');
      chapterUrl = chapterUrl.replace(baseUrl, '');

      novelChapters.push({
        chapterName,
        releaseDate,
        chapterUrl,
      });
    });
    return novelChapters;
  };

  novel.chapters = await getChapters(novelId);

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  chapterUrl = encodeURI(chapterUrl);

  const url = `${baseUrl}${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.chr-title').attr('title');
  let chapterText = loadedCheerio('#chr-content').html();
  const chapter = {
    sourceId: 20,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const searchUrl = 'http://wuxiaworld.cloud/search?keyword=';

  const url = `${searchUrl}${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.col-novel-main > div.list-novel > .row').each(function () {
    let novelUrl = loadedCheerio(this)
      .find('h3.novel-title > a')
      .attr('href')
      .replace(baseUrl + 'novel/', '');
    novelUrl = `${novelUrl}/`;

    const novelName = loadedCheerio(this).find('h3.novel-title > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    const novel = {
      sourceId: 20,
      novelUrl,
      novelName,
      novelCover,
    };

    novels.push(novel);
  });

  return novels;
};

const WuxiaWorldCloudScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default WuxiaWorldCloudScraper;
