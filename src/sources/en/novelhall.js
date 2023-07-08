import * as cheerio from 'cheerio';
import { fetchHtml } from '@utils/fetch/fetch';
import { defaultCoverUri } from '../helpers/constants';

const baseUrl = 'https://www.novelhall.com/';

const sourceId = 6;

const sourceName = 'NovelHall';

const popularNovels = async page => {
  const url = `${baseUrl}all2022-${page}.html`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('li.btm').each(function () {
    const novelName = loadedCheerio(this).find('a').text();
    const novelCover = defaultCoverUri;
    const novelUrl =
      baseUrl + loadedCheerio(this).find('a').attr('href').slice(1);

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

  novel.novelName = loadedCheerio('h1').text();

  novel.novelCover = loadedCheerio('div.book-img > img').attr('src');

  novel.summary = loadedCheerio('div.intro > span.js-close-wrap')
    .text()
    ?.replace('back<<', '');

  loadedCheerio('p[style="display: none;"]').remove();
  novel.author = loadedCheerio('span.blue:contains("Author")')
    .text()
    .replace(/Author：|\n+\t+/g, '');

  novel.genre = loadedCheerio('a.red').text();

  novel.artist = null;

  novel.status = loadedCheerio('span.blue:contains("Status")')
    .text()
    .replace('Status：', '');

  let novelChapters = [];

  loadedCheerio('div.book-catalog.hidden-xs#morelist')
    .find('li.post-11')
    .each(function () {
      let chapterName = loadedCheerio(this).find('a').text();

      let releaseDate = null;

      let chapterUrl = baseUrl + loadedCheerio(this).find('a').attr('href');

      const chapter = {
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
  const body = await fetchHtml({ url: chapterUrl, sourceId });

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1').text();
  const chapterText = loadedCheerio('div.entry-content').html();
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
  const searchUrl = `${baseUrl}index.php?s=so&module=book&keyword=`;

  const url = `${searchUrl}${searchTerm}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('tr').each(function () {
    const novelName = loadedCheerio(this).find('td:nth-child(2) > a').text();
    const novelCover = 'https://cdn.novelupdates.com/imgmid/noimagemid.jpg';
    const novelUrl =
      baseUrl +
      loadedCheerio(this).find('td:nth-child(2) > a').attr('href').slice(1);
    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return novels;
};

const novelhallScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default novelhallScraper;
