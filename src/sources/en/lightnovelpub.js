import cheerio from 'react-native-cheerio';

const baseUrl = 'https://www.lightnovelpub.com/';

const popularNovels = async page => {
  let totalPages = 33;
  let url = baseUrl + 'browse/all/popular/all/' + page;

  let headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent':
      "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
  });

  const result = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.novel-item.ads').remove();

  loadedCheerio('.novel-item').each(function () {
    const novelName = loadedCheerio(this)
      .find('.novel-title')
      .text()
      .replace(/[\t\n]/g, '');

    const novelCover = loadedCheerio(this).find('img').attr('data-src');

    let novelUrl = loadedCheerio(this)
      .find('.novel-title > a')
      .attr('href')
      .replace('/novel/', '');
    novelUrl += '/';

    const novel = {
      sourceId: 15,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return {totalPages, novels};
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}novel/${novelUrl}/`;

  let headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent':
      "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
  });

  const result = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 15;

  novel.sourceName = 'LightNovelPub';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('h1.novel-title')
    .text()
    .replace(/[\t\n]/g, '')
    .trim();

  novel.novelCover = loadedCheerio('figure.cover > img').attr('data-src');

  novel.genre = '';

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

  let totalChapters;

  totalChapters = loadedCheerio('.header-stats > span')
    .first()
    .text()
    .match(/\d+/)[0];

  for (let i = 1; i <= totalChapters; i++) {
    const chapterName = 'Chapter ' + i;

    const releaseDate = null;

    const chapterUrl = 'chapter-' + i;

    const chapter = {chapterName, releaseDate, chapterUrl};

    novelChapters.push(chapter);
  }

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}novel/${novelUrl}/${chapterUrl}`;

  let headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent':
      "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
  });

  const result = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await result.text();
  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h2').text();
  let chapterText = loadedCheerio('#chapter-container').html();
  const chapter = {
    sourceId: 15,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

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

  const result = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  let results = JSON.parse(loadedCheerio('body').text());

  loadedCheerio = cheerio.load(results.resultview);

  loadedCheerio('.novel-item').each(function () {
    const novelName = loadedCheerio(this).find('h4.novel-title').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    let novelUrl = loadedCheerio(this)
      .find('a')
      .attr('href')
      .replace('/novel/', '');
    novelUrl += '/';

    const novel = {
      sourceId: 15,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return novels;
};

const lightNovelPubScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default lightNovelPubScraper;
