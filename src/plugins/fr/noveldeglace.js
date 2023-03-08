import * as cheerio from 'cheerio';
const sourceId = 77;

const sourceName = 'NovelDeGlace';

const baseUrl = 'https://noveldeglace.com/';

const popularNovels = async page => {
  let url = baseUrl + 'roman';

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('article').each(function () {
    const novelName = loadedCheerio(this).find('h2').text().trim();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this)
      .find('h2 > a')
      .attr('href')
      .split('/')[4];

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = baseUrl + 'roman/' + novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = { sourceId, sourceName, url, novelUrl };

  novel.novelName = loadedCheerio(
    'div.entry-content > div > strong',
  )[0].nextSibling.nodeValue.trim();

  novel.novelCover = loadedCheerio('.su-row > div > div > img').attr('src');

  novel.summary = loadedCheerio('div[data-title=Synopsis]').text();

  const author = loadedCheerio(
    'div.romans > div.project-large > div.su-row > div.su-column.su-column-size-3-4 > div > div:nth-child(3) > strong',
  )[0];

  novel.author = author ? author.nextSibling.nodeValue.trim() : null;

  novel.genre = loadedCheerio('.genre')
    .text()
    .replace('Genre : ', '')
    .replace(/, /g, ',');

  let novelChapters = [];

  loadedCheerio('.chpt').each(function () {
    const chapterName = loadedCheerio(this).find('a').text().trim();
    const releaseDate = null;
    const chapterUrl = loadedCheerio(this).find('a').attr('href');

    const chapter = {
      sourceId,
      chapterName,
      releaseDate,
      chapterUrl,
    };

    novelChapters.push(chapter);
  });

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('h2.western').text();
  let chapterText = loadedCheerio('.chapter-content').html();

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
  let url = baseUrl + 'roman';

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('article').each(function () {
    const novelName = loadedCheerio(this).find('h2').text().trim();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this)
      .find('h2 > a')
      .attr('href')
      .split('/')[4];

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  novels = novels.filter(novel =>
    novel.novelName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return novels;
};

const NovelDeGlaceScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelDeGlaceScraper;
