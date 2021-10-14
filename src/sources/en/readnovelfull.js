import cheerio from 'react-native-cheerio';

const baseUrl = 'https://readnovelfull.com';

const popularNovels = async page => {
  let totalPages = 61;
  const url = `${baseUrl}/most-popular-novel?page=${page}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.col-novel-main > div.list-novel > .row').each(function () {
    let novelUrl = loadedCheerio(this)
      .find('h3.novel-title > a')
      .attr('href')
      .replace('.html', '')
      .substring(1);
    novelUrl = `${novelUrl}/`;

    const novelName = loadedCheerio(this).find('h3.novel-title > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    const novel = {
      sourceId: 4,
      novelUrl,
      novelName,
      novelCover,
    };

    novels.push(novel);
  });

  return {totalPages, novels};
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}/${novelUrl.slice(0, -1)}.html`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 4;

  novel.sourceName = 'ReadNovelFull';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('div.book > img').attr('alt');

  novel.novelCover = loadedCheerio('div.book > img').attr('src');

  novel.summary = loadedCheerio('div.desc-text').text().trim();

  novel.author = loadedCheerio('li > h3')
    .filter(function () {
      return loadedCheerio(this).text().trim() === 'Author:';
    })
    .siblings()
    .text();

  novel.genre = loadedCheerio('li')
    .filter(function () {
      return loadedCheerio(this).find('h3').text().trim() === 'Genre:';
    })
    .text()
    .replace('Genre:', '');

  novel.artist = null;

  novel.status = loadedCheerio('li > h3')
    .filter(function () {
      return loadedCheerio(this).text().trim() === 'Status:';
    })
    .siblings()
    .text();

  const novelId = loadedCheerio('#rating').attr('data-novel-id');

  const getChapters = async id => {
    const chapterListUrl =
      'https://readnovelfull.com/ajax/chapter-archive?novelId=' + id;

    const data = await fetch(chapterListUrl);
    const chapters = await data.text();

    loadedCheerio = cheerio.load(chapters);

    let novelChapters = [];

    loadedCheerio('.panel-body')
      .find('li')
      .each(function () {
        let chapterName = loadedCheerio(this).find('a').attr('title');
        let releaseDate = null;
        let chapterUrl = loadedCheerio(this).find('a').attr('href');
        chapterUrl = chapterUrl.replace(`/${novelUrl}`, '');

        novelChapters.push({
          chapterName,
          releaseDate,
          chapterUrl,
        });
      });
    return novelChapters;
  };

  novel.chapters = await getChapters(novelId);

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}/${novelUrl}${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.chr-title').attr('title');
  let chapterText = loadedCheerio('#chr-content').html();
  const chapter = {
    sourceId: 4,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const searchUrl = 'https://readnovelfull.com/search?keyword=';

  const url = `${searchUrl}${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.col-novel-main > div.list-novel > .row').each(function () {
    let novelUrl = loadedCheerio(this)
      .find('h3.novel-title > a')
      .attr('href')
      .replace('.html', '')
      .substring(1);
    novelUrl = `${novelUrl}/`;

    const novelName = loadedCheerio(this).find('h3.novel-title > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    const novel = {
      sourceId: 4,
      novelUrl,
      novelName,
      novelCover,
    };

    novels.push(novel);
  });

  return novels;
};

const readNovelFullScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default readNovelFullScraper;
