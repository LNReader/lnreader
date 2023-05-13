import * as cheerio from 'cheerio';
import { Status } from '../helpers/constants';

const baseUrl = 'https://reaperscans.com';

const sourceId = 67;
const sourceName = 'ReaperScans';

const popularNovels = async page => {
  let url = `${baseUrl}/novels/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.flex-1').each(function () {
    const novelName = loadedCheerio(this).find('a.text-sm').text().trim();
    const novelCover = loadedCheerio(this).find('a > img').attr('src');

    let novelUrl = loadedCheerio(this).find('div > a').attr('href');

    if (novelUrl) {
      novelUrl = novelUrl.replace(`${baseUrl}/novels/`, '');

      novels.push({
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      });
    }
  });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}/novels/${novelUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
  };

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('.p-2 > .container h1').text().trim();

  novel.novelCover = loadedCheerio('.p-2  > .container img').attr('src');

  loadedCheerio('dl.mt-2 > div.py-2').each(function () {
    const detailName = loadedCheerio(this).find('dt').text().trim();
    const detail = loadedCheerio(this).find('dd').text().trim();

    switch (detailName) {
      case 'Genre(s)':
        novel.genre = detail.replace(/[\t\n]/g, ',');
        break;
      case 'Author(s)':
        novel.author = detail;
        break;
      case 'Release Status':
        novel.status = detail.includes('Ongoing')
          ? Status.ONGOING
          : Status.COMPLETED;
        break;
    }
  });

  novel.summary = loadedCheerio('div.p-4 > p.prose').text().trim();

  let novelLastPage = 1;
  loadedCheerio('nav span.inline-flex button').each(function () {
    let number = loadedCheerio(this).text().trim();
    if (!isNaN(number) && Number(number) > novelLastPage) {
      novelLastPage = Number(number);
    }
  });

  let novelChapters = [];

  let tableOfContents = [];
  tableOfContents.push(loadedCheerio);

  for (let i = 2; i <= novelLastPage; i++) {
    let pUrl = url + '?page=' + i;
    let pResult = await fetch(pUrl);
    let pBody = await pResult.text();

    tableOfContents.push(cheerio.load(pBody));
  }

  for (let page of tableOfContents) {
    page('.mt-6 > .pb-4 li').each(function () {
      const chapterName = page(this)
        .find('div.text-sm > p.truncate')
        .text()
        .trim();
      const releaseDate = page(this)
        .find('div.mt-2 p')
        .text()
        .trim()
        .replace('Released', '')
        .trim();

      const chapterUrl = page(this)
        .find('a')
        .attr('href')
        .replace(url + '/chapters/', '');

      const chapter = { chapterName, releaseDate, chapterUrl };

      novelChapters.push(chapter);
    });
  }

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}/novels/${novelUrl}/chapters/${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('nav.px-4 > div.mb-2').text();
  let chapterText = loadedCheerio('article').html();
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
  const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga&genre%5B%5D=novel`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.c-tabs-item__content').each(function () {
    const novelName = loadedCheerio(this).find('.container > h3').text().trim();
    const novelCover = loadedCheerio(this)
      .find('div > div > a > img')
      .attr('data-src');

    let novelUrl = loadedCheerio(this).find('div > div > a').attr('href');
    if (novelUrl) {
      novelUrl = novelUrl.replace(`${baseUrl}/series/`, '');

      novels.push({
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      });
    }
  });

  return novels;
};

const ReaperScansScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default ReaperScansScraper;
