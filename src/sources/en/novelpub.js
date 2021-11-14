import cheerio from 'react-native-cheerio';

const baseUrl = 'https://www.novelpub.com/';

const sourceName = 'NovelPub';
const sourceId = 94;

const popularNovels = async page => {
  let totalPages = 40;
  let url = baseUrl + 'browse/all/popular/all/' + page;

  let headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent':
      "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
  });

  const result = await fetch(url, {method: 'GET', headers: headers});
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.novel-item.ads').remove();

  loadedCheerio('.novel-item').each(function () {
    const novelName = loadedCheerio(this).find('.novel-title').text().trim();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');
    const novelUrl =
      baseUrl +
      loadedCheerio(this).find('.novel-title > a').attr('href').substring(1);

    const novel = {sourceId, novelName, novelCover, novelUrl};

    novels.push(novel);
  });

  return {totalPages, novels};
};

const parseNovelAndChapters = async novelUrl => {
  const url = novelUrl;

  let headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent':
      "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
  });

  const result = await fetch(url, {method: 'GET', headers: headers});
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {url, novelUrl, sourceId, sourceName, genre: ''};

  novel.novelName = loadedCheerio('h1.novel-title').text().trim();

  novel.novelCover = loadedCheerio('figure.cover > img').attr('data-src');

  loadedCheerio('div.categories > ul > li').each(function () {
    novel.genre +=
      loadedCheerio(this)
        .text()
        .replace(/[\t\n]/g, '') + ',';
  });

  loadedCheerio('div.header-stats > span').each(function () {
    if (loadedCheerio(this).find('small').text() === 'Status') {
      novel.status = loadedCheerio(this).find('strong').text();
    }
  });

  novel.genre = novel.genre.slice(0, -1);

  novel.author = loadedCheerio('.author > a > span').text();

  novel.summary = loadedCheerio('.summary > .content').text().trim();

  let novelChapters = [];

  const delay = ms => new Promise(res => setTimeout(res, ms));

  let lastPage = 1;

  lastPage = loadedCheerio(
    '#novel > header > div.header-body.container > div.novel-info > div.header-stats > span:nth-child(1) > strong',
  )
    .text()
    ?.trim();

  lastPage = Math.ceil(lastPage / 100);

  for (let i = 1; i <= lastPage; i++) {
    const chaptersUrl = `${baseUrl}novel/the-legendary-mechanic-novel/chapters/page-${i}`;

    const chaptersRequest = await fetch(chaptersUrl);
    const chaptersHtml = await chaptersRequest.text();

    loadedCheerio = cheerio.load(chaptersHtml);

    loadedCheerio('.chapter-list li').each(function () {
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

      novelChapters.push({chapterName, releaseDate, chapterUrl});
    });

    delay(1000);
  }

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  let headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent':
      "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
  });

  const result = await fetch(url, {method: 'GET', headers: headers});

  const body = await result.text();
  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h2').text();
  const chapterText = loadedCheerio('#chapter-container').html();

  const chapter = {sourceId, novelUrl, chapterUrl, chapterName, chapterText};

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `${baseUrl}lnwsearchlive?inputContent=${searchTerm}`;

  let headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent':
      "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
  });

  const result = await fetch(url, {method: 'GET', headers: headers});
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  let results = JSON.parse(loadedCheerio('body').text());

  loadedCheerio = cheerio.load(results.resultview);

  loadedCheerio('.novel-item').each(function () {
    const novelName = loadedCheerio(this).find('.novel-title').text().trim();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl =
      baseUrl + loadedCheerio(this).find('a').attr('href').substring(1);

    const novel = {sourceId, novelName, novelCover, novelUrl};

    novels.push(novel);
  });

  return novels;
};

const NovelPubScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelPubScraper;
