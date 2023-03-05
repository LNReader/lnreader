import * as cheerio from 'cheerio';
const baseUrl = 'https://hasutl.wordpress.com/';

const popularNovels = async page => {
  let url = baseUrl + 'light-novels-activas/';

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.wp-block-columns').each(function () {
    const novelName = loadedCheerio(this).find('.wp-block-button').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    let novelUrl = loadedCheerio(this)
      .find('.wp-block-button > a')
      .attr('href');
    novelUrl = novelUrl.replace(baseUrl, '');

    const novel = {
      sourceId: 29,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}/${novelUrl}/`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 29;

  novel.sourceName = 'Hasu Translations';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('.post-header').text();

  novel.novelCover = loadedCheerio('.featured-media > img').attr('src');

  let details = loadedCheerio('.post-content').find('p').html();

  const detailName = details.match(/<strong>(.|\n)*?<\/strong>/g);
  details = details.match(/<\/strong>(.|\n)*?<br>/g);
  details = details.map(detail => detail.replace(/<\/strong>|<br>/g, ''));

  novel.genre = '';

  detailName.map((detail, index) => {
    if (detail.includes('Autor')) {
      novel.author = details[index];
    }
    if (detail.includes('Géneros')) {
      novel.genre = details[index].replace(/\s/g, '');
    }
    if (detail.includes('Artista')) {
      novel.artist = details[index];
    }
  });

  let novelSummary = loadedCheerio('.post-content').find('p').html();
  novel.summary = novelSummary;

  let novelChapters = [];

  loadedCheerio('.wp-block-media-text__content')
    .find('a')
    .each(function () {
      const chapterName = loadedCheerio(this).text().trim();

      const releaseDate = null;

      let chapterUrl = loadedCheerio(this).attr('href').split('/');
      chapterUrl = chapterUrl[chapterUrl.length - 2];

      const chapter = { chapterName, releaseDate, chapterUrl };

      novelChapters.push(chapter);
    });

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}/${novelUrl}/${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('.post-title').text();

  let chapterText = loadedCheerio('.post-content').html();
  novelUrl = novelUrl + '/';
  chapterUrl = chapterUrl;

  const chapter = {
    sourceId: 29,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.post-container ').each(function () {
    const novelName = loadedCheerio(this).find('.post-header').text();
    if (
      !novelName.includes('Cap') &&
      !novelName.includes('Vol') &&
      !novelName.includes('Light Novels')
    ) {
      const novelCover = loadedCheerio(this).find('img').attr('src');

      let novelUrl = loadedCheerio(this).find('a').attr('href');
      novelUrl = novelUrl.replace(baseUrl, '');

      const novel = {
        sourceId: 29,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    }
  });

  return novels;
};
const HasuTlScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default HasuTlScraper;
