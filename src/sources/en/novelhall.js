import cheerio from 'react-native-cheerio';

const baseUrl = 'https://www.novelhall.com/';

const popularNovels = async page => {
  let totalPages = 1;
  const result = await fetch(baseUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.section1')
    .find('li')
    .each(function () {
      const novelName = loadedCheerio(this).find('.book-info > h2 > a').text();
      const novelCover = loadedCheerio(this).find('img').attr('src');
      const novelUrl = loadedCheerio(this).find('a').attr('href').substring(1);

      const novel = {
        sourceId: 6,
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

  novel.sourceId = 6;

  novel.sourceName = 'NovelHall';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('h1').text();

  novel.novelCover = loadedCheerio('div.book-img > img').attr('src');

  novel.summary = loadedCheerio('div.intro')
    .text()
    .replace(/[\t\n]/g, '');

  novel.author = loadedCheerio('span.blue')
    .first()
    .text()
    .replace('Author：', '');

  novel.genre = loadedCheerio('a.red').text();

  novel.artist = null;

  novel.status = loadedCheerio('span.blue')
    .first()
    .next()
    .text()
    .replace('Status：', '');

  let novelChapters = [];

  loadedCheerio('div.book-catalog.hidden-xs#morelist')
    .find('li.post-11')
    .each(function () {
      let chapterName = loadedCheerio(this).find('a').text();

      let releaseDate = null;

      let chapterUrl = loadedCheerio(this).find('a').attr('href');

      if (chapterUrl) {
        chapterUrl = chapterUrl.replace(`/${novelUrl}/`, '');
      }

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
  const url = `${baseUrl}${novelUrl}/${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1').text();
  const chapterText = loadedCheerio('div.entry-content').html();
  const chapter = {
    sourceId: 6,
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

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('tr').each(function () {
    let novelName = loadedCheerio(this).find('td:nth-child(2)').text();
    novelName = novelName.replace(/[\t\n]/g, '');

    const novelCover = 'https://cdn.novelupdates.com/imgmid/noimagemid.jpg';

    let novelUrl = loadedCheerio(this).find('td:nth-child(2) >').attr('href');
    if (novelUrl) {
      novelUrl = novelUrl.slice(1);
    }

    const novel = {
      sourceId: 6,
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
