import cheerio from 'react-native-cheerio';

const baseUrl = 'https://www.novelupdates.cc/';

const popularNovels = async page => {
  let totalPages = 1;
  const result = await fetch(baseUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.section-item').each(function () {
    const novelName = loadedCheerio(this).find('.book-name').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    let novelUrl = loadedCheerio(this).find('a').attr('href').slice(1);

    const novel = {
      sourceId: 18,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return {totalPages, novels};
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}${novelUrl}/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 18;

  novel.sourceName = 'NovelUpdates.cc';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('.book-name').text();

  novel.novelCover = loadedCheerio('div.book-img > img').attr('src');

  novel.genre = loadedCheerio('div.book-catalog > span.txt').text();

  novel.status = loadedCheerio('div.book-state > span.txt').text();

  novel.author = loadedCheerio('div.author > span.name').text();

  const novelSummary = loadedCheerio('div.content > p.desc').text();
  novel.summary = novelSummary.trim();

  let novelChapters = [];

  loadedCheerio('.chapter-item').each(function () {
    const chapterName = loadedCheerio(this).find('.chapter-name').text();
    const releaseDate = null;
    const chapterUrl = loadedCheerio(this).attr('href').slice(1);

    novelChapters.push({
      chapterName,
      releaseDate,
      chapterUrl,
    });
  });

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1.chapter-title').text();
  let chapterText = loadedCheerio('div.chapter-entity').html();
  const chapter = {
    sourceId: 18,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `${baseUrl}search/${searchTerm}/1`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.list-item').each(function () {
    loadedCheerio(this).find('font').remove();

    const novelName = loadedCheerio(this).find('.book-name').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    let novelUrl = loadedCheerio(this).find('a').attr('href').slice(1);

    const novel = {
      sourceId: 18,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return novels;
};

const novelUpdatesCcScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default novelUpdatesCcScraper;
