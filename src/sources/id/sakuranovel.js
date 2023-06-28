import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';

const sourceId = 103;
const sourceName = 'SakuraNovel';

const baseUrl = 'https://sakuranovel.id/';

const popularNovels = async page => {
  const url = `${baseUrl}advanced-search/page/${page}/?title&author&yearx&status&type&order=rating&country%5B0%5D=china&country%5B1%5D=jepang&country%5B2%5D=unknown`;

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

    const novel = { sourceId, novelName, novelCover, novelUrl };

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
  const chapName = novel.novelName
    .split(' ')
    .map(chap => {
      return chap[0].toUpperCase() + chap.slice(1);
    })
    .join(' ');

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
    let titles = loadedCheerio(this)
      .attr('title')
      .replace(/Bahasa Indonesia/g, '')
      .replace(/\s\s+/g, ' ')
      .trim();

    let titlename = titles
      .split(' ')
      .map(title => {
        return title[0].toUpperCase() + title.slice(1);
      })
      .join(' ');

    const chapterName = titlename.replace(`${chapName}`, '');
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
  const chapterText = loadedCheerio('.readers').html();

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
  const url = `${baseUrl}?s=${searchTerm}`;

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

const SakuraNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default SakuraNovelScraper;
