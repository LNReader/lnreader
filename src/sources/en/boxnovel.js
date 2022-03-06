import * as cheerio from 'cheerio';
const baseUrl = 'https://boxnovel.com/novel';
const searchUrl = 'https://boxnovel.com/';

const sourceId = 1;

const popularNovels = async page => {
  let url = `${baseUrl}/page/${page}/?m_orderby=rating`;
  let totalPages = 73;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.page-item-detail').each(function () {
    const novelName = loadedCheerio(this).find('h3 > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    let novelUrl = loadedCheerio(this).find('h3 > a').attr('href');
    novelUrl = novelUrl.replace(`${baseUrl}/`, '');

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}/${novelUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  loadedCheerio('.post-title > h3 > span').remove();

  novel.sourceId = 1;

  novel.sourceName = 'BoxNovel';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('.post-title > h3')
    .text()
    .replace(/[\t\n]/g, '')
    .trim();

  novel.novelCover = loadedCheerio('.summary_image > a > img').attr('src');

  loadedCheerio('.post-content_item').each(function () {
    const detailName = loadedCheerio(this)
      .find('.summary-heading > h5')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();
    const detail = loadedCheerio(this)
      .find('.summary-content')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();

    switch (detailName) {
      case 'Genre(s)':
        novel.genre = detail.trim().replace(/[\t\n]/g, ',');
        break;
      case 'Author(s)':
        novel.author = detail.trim();
        break;
      case 'Artist(s)':
        novel.status = detail.trim();
        break;
    }
  });

  loadedCheerio('.description-summary > div.summary__content')
    .find('em')
    .remove();

  novel.summary = loadedCheerio('.description-summary > div.summary__content')
    .text()
    .replace(/[\t\n]|Description|Summary/g, '');

  let novelChapters = [];

  const data = await fetch(`${url}ajax/chapters/`, { method: 'POST' });
  const text = await data.text();

  loadedCheerio = cheerio.load(text);

  loadedCheerio('.wp-manga-chapter').each(function () {
    const chapterName = loadedCheerio(this)
      .find('a')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();

    const releaseDate = loadedCheerio(this)
      .find('span')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();

    const chapterUrl = loadedCheerio(this)
      .find('a')
      .attr('href')
      .replace(url, '');

    const chapter = { chapterName, releaseDate, chapterUrl };

    novelChapters.push(chapter);
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}/${novelUrl}/${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('div.text-left > h3').text();
  let chapterText = loadedCheerio('.reading-content').html();
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
  const url = `${searchUrl}?s=${searchTerm}&post_type=wp-manga&m_orderby=rating`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.c-tabs-item__content').each(function () {
    const novelName = loadedCheerio(this).find('h4 > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    let novelUrl = loadedCheerio(this).find('h4 > a').attr('href');
    novelUrl = novelUrl.replace(`${baseUrl}/`, '');

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

const BoxNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default BoxNovelScraper;
