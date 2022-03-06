import cheerio from 'react-native-cheerio';

const baseUrl = 'https://www.wuxiaworld.com/';

const popularNovels = async page => {
  let totalPages = 1;
  const url = `${baseUrl}api/novels`;

  const result = await fetch(url);
  const data = await result.json();

  let novels = [];

  data.items.map(novel => {
    let novelName = novel.name;
    let novelCover = novel.coverUrl;
    let novelUrl = novel.slug;

    novels.push({
      sourceId: 7,
      novelUrl,
      novelName,
      novelCover,
    });
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}novel/${novelUrl}/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 7;

  novel.sourceName = 'WuxiaWorld';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('h2').text();

  novel.novelCover = loadedCheerio('img.img-thumbnail').attr('src');

  novel.summary = loadedCheerio('h3')
    .filter(function () {
      return loadedCheerio(this).text().trim() === 'Synopsis';
    })
    .next()
    .text()
    .trim();

  novel.author = loadedCheerio('div > dt')
    .filter(function () {
      return loadedCheerio(this).text().trim() === 'Author:';
    })
    .next()
    .text();

  let genres = [];

  loadedCheerio('.genres')
    .find('div')
    .each(function (res) {
      genres.push(loadedCheerio(this).find('a').text());
    });

  novel.genre = genres.join(',');

  novel.artist = null;

  novel.status = null;

  novel.status = loadedCheerio('div.fr-view.pt-10').text().includes('Complete')
    ? 'Completed'
    : 'Ongoing';

  let novelChapters = [];

  loadedCheerio('.chapter-item').each(function () {
    let chapterName = loadedCheerio(this).text();
    chapterName = chapterName.replace(/[\t\n]/g, '');

    const releaseDate = null;

    let chapterUrl = loadedCheerio(this).find('a').attr('href');
    chapterUrl = chapterUrl.replace(`/novel/${novelUrl}/`, '');

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
  let url = `${baseUrl}novel/${novelUrl}/${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  loadedCheerio('.chapter-nav').remove();

  let chapterName = loadedCheerio('#sidebar-toggler-container').next().text();
  chapterName = chapterName.replace(/[\t\n]/g, '');

  loadedCheerio('#chapter-content > script').remove();

  let chapterText = loadedCheerio('#chapter-content').html();

  const chapter = {
    sourceId: 7,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const searchUrl = 'https://www.wuxiaworld.com/api/novels/search?query=';

  const url = `${searchUrl}${searchTerm}`;

  const result = await fetch(url);
  const data = await result.json();

  let novels = [];

  data.items.map(novel => {
    let novelName = novel.name;
    let novelCover = novel.coverUrl;
    let novelUrl = novel.slug;

    novels.push({
      sourceId: 7,
      novelUrl,
      novelName,
      novelCover,
    });
  });

  return novels;
};

const WuxiaWorldScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default WuxiaWorldScraper;
