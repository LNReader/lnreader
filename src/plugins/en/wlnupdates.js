import * as cheerio from 'cheerio';
import { Status, defaultCoverUri } from '../helpers/constants';
import NovelUpdatesScraper from './novelupdates';

const sourceId = 62;

const sourceName = 'WLNUpdates';

const baseUrl = 'https://www.wlnupdates.com/';

let headers = new Headers({
  'User-Agent':
    "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
});

const popularNovels = async page => {
  let url = `${baseUrl}highest-rated/` + page;

  const result = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels = [];

  loadedCheerio('table').find('tr').first().remove();

  loadedCheerio('tr').each(function (res) {
    const novelCover = defaultCoverUri;
    const novelName = loadedCheerio(this).find('td > a').text();
    const novelUrl =
      'https://www.wlnupdates.com' +
      loadedCheerio(this).find('td > a').attr('href');

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
  const url = novelUrl;

  const result = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
  };

  novel.novelName = loadedCheerio('h2').text();

  novel.novelCover = defaultCoverUri;

  novel.author = loadedCheerio('.multiitem#author')
    .text()
    .trim()
    .replace(/[\t\n]/g, '');

  novel.genre = loadedCheerio('.multiitem#genre')
    .text()
    .trim()
    .replace(/[\t\n]/g, '');

  novel.status = Status.UNKNOWN;

  let summary = loadedCheerio('#description').text().trim();

  novel.summary = summary;

  let novelChapters = [];

  loadedCheerio('#release-entry').each(function () {
    let chapterName;

    if (loadedCheerio(this).find('td.numeric').length > 1) {
      chapterName =
        'Volume ' +
        loadedCheerio(this).find(' td:nth-child(3)').text().trim() +
        ' Chapter ' +
        loadedCheerio(this).find(' td:nth-child(4)').text().trim();
    } else if (loadedCheerio(this).find('td.numeric').length > 0) {
      chapterName =
        'Chapter ' + loadedCheerio(this).find('td.numeric').text().trim();
    } else {
      chapterName = loadedCheerio(this).find('td.postfix').text().trim();
    }

    const releaseDate = loadedCheerio(this)
      .find('.release-entry-cell')
      .text()
      .trim();

    const chapterUrl = loadedCheerio(this)
      .find('td:nth-child(1) > a')
      .attr('href');

    novelChapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const chapterName = '';
  const chapterText = (
    await NovelUpdatesScraper.parseChapter(novelUrl, chapterUrl)
  ).chapterText;

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
  const url = baseUrl + 'search?title=' + searchTerm;

  const res = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await res.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('tr').each(function () {
    const novelCover = defaultCoverUri;
    const novelName = loadedCheerio(this).find('td > a').text();
    const novelUrl =
      'https://www.wlnupdates.com' +
      loadedCheerio(this).find('td > a').attr('href');

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

const WLNUpdatesScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default WLNUpdatesScraper;
