import * as cheerio from 'cheerio';
const sourceId = 82;
const sourceName = 'MTLReader';

const baseUrl = 'https://mtlreader.com/';

const popularNovels = async page => {
  const url = `${baseUrl}novels?page=${page}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.col-md-4.col-sm-4').each(function () {
    const novelName = loadedCheerio(this).find('h5').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this).find('h5 > a').attr('href');

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

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
    novelName: '',
    novelCover: '',
    author: '',
    status: '',
    genre: '',
    summary: '',
    chapters: [],
  };

  novel.novelName = loadedCheerio('.agent-title').text().trim();

  novel.novelCover = loadedCheerio(
    '#agent-p-2 > div > div > div.col-md-5.col-sm-5.col-xs-12 > div > img',
  ).attr('src');

  novel.summary = loadedCheerio('#editdescription').text().trim();

  novel.author = loadedCheerio(
    '#agent-p-2 > div > div > div.col-md-7.col-sm-7.col-xs-12 > div.agent-p-contact > div:nth-child(2)',
  )
    .text()
    ?.replace('Author:', '')
    .trim();

  let chapters = [];

  loadedCheerio('tr.spaceUnder').each(function () {
    const chapterName = loadedCheerio(this).find('a').text().trim();
    const releaseDate = null;
    const chapterUrl = loadedCheerio(this).find('a').attr('href');

    chapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = chapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio(
    '#news-section-1 > div.flex-row.pt-5.pb-5 > div',
  ).text();
  const chapterText = loadedCheerio('.container').html();

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
  const url = `${baseUrl}search?input=${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.col-md-4.col-sm-4').each(function () {
    const novelName = loadedCheerio(this).find('h5').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this).find('h5 > a').attr('href');

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

const MTLReaderScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default MTLReaderScraper;
