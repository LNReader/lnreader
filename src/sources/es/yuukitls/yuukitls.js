import cheerio from 'react-native-cheerio';

const baseUrl = 'https://yuukitls.com/';

const popularNovels = async page => {
  let totalPages = 1;
  let url = baseUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.menu-item-2869')
    .find('.menu-item.menu-item-type-post_type.menu-item-object-post')
    .each(function () {
      const novelName = loadedCheerio(this).text();
      const novelCover = loadedCheerio(this).find('img').attr('src');

      let novelUrl = loadedCheerio(this).find('a').attr('href');
      novelUrl = novelUrl.split('/');
      novelUrl = novelUrl[novelUrl.length - 2] + '/';

      const novel = {
        sourceId: 28,
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

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 28;

  novel.sourceName = 'YuukiTls';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('h1.entry-title')
    .text()
    .replace(/[\t\n]/g, '')
    .trim();

  novel.novelCover = loadedCheerio('img[loading="lazy"]').attr('src');

  loadedCheerio('.entry-content')
    .find('div')
    .each(function () {
      if (loadedCheerio(this).text().includes('Escritor:')) {
        novel.author = loadedCheerio(this)
          .text()
          .replace('Escritor: ', '')
          .trim();
      }
      if (loadedCheerio(this).text().includes('Ilustrador:')) {
        novel.artist = loadedCheerio(this)
          .text()
          .replace('Ilustrador: ', '')
          .trim();
      }

      if (loadedCheerio(this).text().includes('Género:')) {
        novel.genre = loadedCheerio(this)
          .text()
          .replace(/Género: |\s/g, '');
      }

      if (loadedCheerio(this).text().includes('Sinopsis:')) {
        novel.summary = loadedCheerio(this).next().text();
      }
    });

  let novelChapters = [];

  if (loadedCheerio('.entry-content').find('li').length) {
    loadedCheerio('.entry-content')
      .find('li')
      .each(function () {
        let chapterUrl = loadedCheerio(this).find('a').attr('href');

        if (chapterUrl && chapterUrl.includes(baseUrl)) {
          const chapterName = loadedCheerio(this).text();
          const releaseDate = null;

          chapterUrl = chapterUrl.split('/');
          chapterUrl = chapterUrl[chapterUrl.length - 2] + '/';

          const chapter = {chapterName, releaseDate, chapterUrl};

          novelChapters.push(chapter);
        }
      });
  } else {
    loadedCheerio('.entry-content')
      .find('p')
      .each(function () {
        let chapterUrl = loadedCheerio(this).find('a').attr('href');

        if (chapterUrl && chapterUrl.includes(baseUrl)) {
          const chapterName = loadedCheerio(this).text();
          const releaseDate = null;

          chapterUrl = chapterUrl.split('/');
          chapterUrl = chapterUrl[chapterUrl.length - 2] + '/';

          const chapter = {chapterName, releaseDate, chapterUrl};

          novelChapters.push(chapter);
        }
      });
  }

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}/${novelUrl}/${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('h3').text();

  let chapterText = loadedCheerio('.entry-content').html();
  novelUrl = novelUrl + '/';
  chapterUrl = chapterUrl + '/';

  const chapter = {
    sourceId: 28,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  searchTerm = searchTerm.toLowerCase();

  let url = baseUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.menu-item-2869')
    .find('.menu-item.menu-item-type-post_type.menu-item-object-post')
    .each(function () {
      const novelName = loadedCheerio(this).text();
      const novelCover = loadedCheerio(this).find('img').attr('src');

      let novelUrl = loadedCheerio(this).find('a').attr('href');
      novelUrl = novelUrl.split('/');
      novelUrl = novelUrl[novelUrl.length - 2] + '/';

      const novel = {
        sourceId: 28,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    });

  novels = novels.filter(novel =>
    novel.novelName.toLowerCase().includes(searchTerm),
  );

  return novels;
};

const YuukiTlsScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default YuukiTlsScraper;
