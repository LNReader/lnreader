import * as cheerio from 'cheerio';
import { fetchHtml } from '@utils/fetch/fetch';
import { startCase } from 'lodash-es';

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

  novel.novelName = startCase(loadedCheerio('.series-title h2').text().trim());

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

  loadedCheerio('.series-chapterlist li a').each(function () {
    let titles = startCase(
      loadedCheerio(this)
        .attr('title')
        .replace(/Bahasa Indonesia/g, '')
        .replace(/\s\s+/g, ' ')
        .trim(),
    );

    const chapterName = titles.replace(`${novel.novelName}`, '');
    const releaseDate = loadedCheerio(this).find('span:last').text();
    const chapterUrl = loadedCheerio(this).attr('href');

    chapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = chapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const body = await fetchHtml({ url: chapterUrl, sourceId });

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.title-chapter').text();
  const chapterText = loadedCheerio('.entry-content').html();

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
