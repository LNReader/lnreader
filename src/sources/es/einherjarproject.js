import * as cheerio from 'cheerio';
const baseUrl = 'https://einherjarproject.net/';

const popularNovels = async page => {
  let totalPages = 1;
  let url = baseUrl + 'proyectos-activos/';

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.wp-block-media-text').each(function () {
    const novelName = loadedCheerio(this).find('a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    let novelUrl = loadedCheerio(this)
      .find('.wp-block-media-text__content')
      .find('a')
      .attr('href');
    novelUrl = novelUrl.replace(baseUrl, '');

    const novel = {
      sourceId: 25,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = baseUrl + novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 25;

  novel.sourceName = 'Einherjar Project';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('h1').text();

  novel.novelCover = loadedCheerio('img').attr('src');

  loadedCheerio('.wp-block-columns')
    .find('li')
    .each(function () {
      if (loadedCheerio(this).text().includes('Autor:')) {
        novel.author = loadedCheerio(this)
          .text()
          .replace('Autor:', '')
          .slice(0, -1);
      }
      if (loadedCheerio(this).text().includes('Ilustrador: ')) {
        novel.artist = loadedCheerio(this)
          .text()
          .replace('Ilustrador: ', '')
          .slice(0, -1);
      }
      if (loadedCheerio(this).text().includes('Estado: ')) {
        novel.status = loadedCheerio(this)
          .text()
          .replace('Estado: ', '')
          .slice(0, -1);
      }
    });

  novel.genre = loadedCheerio('.post-content > h6')
    .text()
    .replace(/GÉNEROS: /, '')
    .replace(/,\s/g, ',');

  let novelSummary = loadedCheerio(
    '.post-content > .has-text-align-center',
  ).html();

  novel.summary = novelSummary.trim();

  let novelChapters = [];

  loadedCheerio('.wp-block-media-text')
    .find('p')
    .each(function () {
      if (loadedCheerio(this).find('a').text()) {
        const chapterName = loadedCheerio(this).text();
        const releaseDate = null;
        let chapterUrl = loadedCheerio(this)
          .find('a')
          .attr('href')
          .replace(baseUrl, '');
        if (chapterUrl.includes(novelUrl + '/')) {
          chapterUrl = chapterUrl.replace(novelUrl + '/', '');
        }

        const chapter = { chapterName, releaseDate, chapterUrl };

        novelChapters.push(chapter);
      }
    });

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = baseUrl + chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('h1.post-title').text();

  let chapterText = loadedCheerio('.post-content').html();
  novelUrl = novelUrl + '/';
  chapterUrl = chapterUrl + '/';

  const chapter = {
    sourceId: 25,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = baseUrl + '?s=' + searchTerm;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.post-container')
    .find('div.type-page')
    .each(function () {
      const novelName = loadedCheerio(this)
        .find('.post-header')
        .text()
        .replace(/\n/g, '');
      if (
        !novelName.includes('EPUBs') &&
        !novelName.includes('Proyectos Activos') &&
        !novelName.includes('Chapter')
      ) {
        const novelCover = loadedCheerio(this).find('img').attr('src');

        let novelUrl = loadedCheerio(this)
          .find('a')
          .attr('href')
          .replace(baseUrl, '');

        const novel = {
          sourceId: 25,
          novelName,
          novelCover,
          novelUrl,
        };

        novels.push(novel);
      }
    });

  return novels;
};

const EinharjarProjectScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default EinharjarProjectScraper;
