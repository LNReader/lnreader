import * as cheerio from 'cheerio';
import { fetchHtml } from '@utils/fetch/fetch';

const sourceId = 87;
const sourceName = 'IndoWebNovel';

const baseUrl = 'http://indowebnovel.id/';

const popularNovels = async page => {
  const url = `${baseUrl}id/advanced-search/page/${page}/?title=&author=&yearx=&status=&type=&order=title&country[]=china&country[]=jepang&country[]=korea&country[]=unknown`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.flexbox2-item').each(function () {
    const novelName = loadedCheerio(this)
      .find('.flexbox2-title span')
      .first()
      .text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this)
      .find('.flexbox2-content > a')
      .attr('href');

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
  const body = await fetchHtml({ url: novelUrl, sourceId });

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
  };

  novel.novelName = loadedCheerio('.series-title h2').text().trim();

  novel.novelCover = loadedCheerio('.series-thumb img').attr('src');

  loadedCheerio('.series-infolist > li').each(function () {
    const detailName = loadedCheerio(this).find('b').text().trim();
    const detail = loadedCheerio(this).find('b').next().text().trim();

    switch (detailName) {
      case 'Author':
        novel.author = detail;
        break;
    }
  });

  novel.status = loadedCheerio('.status').text().trim();

  novel.genre = loadedCheerio('.series-genres')
    .children('a')
    .map((i, el) => loadedCheerio(el).text())
    .toArray()
    .join(',');

  loadedCheerio('.series-synops div').remove();
  novel.summary = loadedCheerio('.series-synops').text().trim();

  let chapters = [];

  loadedCheerio('.series-chapterlist li').each(function () {
    const chapterName = loadedCheerio(this)
      .find('a span')
      .first()
      .text()
      .replace(/.*?(Chapter.|[0-9])/g, '$1')
      .replace(/Bahasa Indonesia/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const releaseDate = loadedCheerio(this)
      .find('a span')
      .first()
      .next()
      .text();
    const chapterUrl = loadedCheerio(this).find('a').attr('href');

    chapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = chapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const body = await fetchHtml({ url: chapterUrl, sourceId });

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.title-chapter').text();
  const chapterText = loadedCheerio('.reader').html();

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
  const url = `${baseUrl}id/?s=${searchTerm}`;

  const body = await fetchHtml({ url, sourceId });

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.flexbox2-item').each(function () {
    const novelName = loadedCheerio(this)
      .find('.flexbox2-title span')
      .first()
      .text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this)
      .find('.flexbox2-content > a')
      .attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return novels;
};

const IndoWebNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default IndoWebNovelScraper;
