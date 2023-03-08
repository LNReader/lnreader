import * as cheerio from 'cheerio';
const sourceId = 48;

const sourceName = 'Wuxia.Blog';

const baseUrl = 'https://www.wuxia.blog/';

const popularNovels = async page => {
  let url = `${baseUrl}listNovels`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.panel-body > table')
    .find('tr')
    .each(function () {
      const novelName = loadedCheerio(this).find('td.novel').text();

      if (novelName) {
        const novelId = loadedCheerio(this).find('td:nth-child(1)').text();

        const novelCover = baseUrl + '/data/image/' + novelId + '.jpg';

        let novelUrl = loadedCheerio(this)
          .find('td.novel > a')
          .attr('href')
          .replace('/novel/', '');

        const novel = {
          sourceId,
          novelName,
          novelCover,
          novelUrl,
        };

        novels.push(novel);
      }
    });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}novel/${novelUrl}/`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
  };

  novel.novelName = loadedCheerio(
    'body > div.container-fluid.text-center > div.row.content > div.col-sm-8.text-left > div:nth-child(6) > div.panel-heading.clearfix > h4',
  ).text();

  novel.novelCover = loadedCheerio('img[itemprop="image"]').attr('src');

  novel.author = loadedCheerio(
    'div.col-md-6 > div > div:nth-child(2) > div > div:nth-child(2) > a',
  ).text();

  novel.genre = loadedCheerio(
    'div.row > div.col-md-6 > div > a:nth-child(4)',
  ).text();

  novel.summary = loadedCheerio('div[itemprop="description"]')
    .find('p')
    .text()
    .trim();

  let novelChapters = [];

  loadedCheerio('table#chplist > #chapters > tr').each(function () {
    const chapterName = loadedCheerio(this).find('a').text();

    const releaseDate = loadedCheerio(this)
      .find('td:nth-child(2)')
      .text()
      .replace(/-/g, '/');

    const chapterUrl = loadedCheerio(this)
      .find('a')
      .attr('href')
      .replace(url, '');

    const chapter = {
      chapterName,
      releaseDate,
      chapterUrl,
    };

    novelChapters.push(chapter);
  });

  let moreChaptersUrl =
    baseUrl +
    'temphtml/_tempChapterList_all_' +
    loadedCheerio('div#more').attr('data-nid') +
    '.html';

  let moreChapters = await fetch(moreChaptersUrl);
  let moreChaptersString = await moreChapters.text();

  loadedCheerio = cheerio.load(moreChaptersString);

  loadedCheerio('a').each(function () {
    const chapterName = loadedCheerio(this).text();

    const releaseDate = loadedCheerio(this)[0]
      .nextSibling.nodeValue.replace(/-/g, '/')
      .trim();

    const chapterUrl = loadedCheerio(this).attr('href').replace(url, '');

    const chapter = {
      chapterName,
      releaseDate,
      chapterUrl,
    };

    novelChapters.push(chapter);
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}novel/${novelUrl}/${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('div.panel-body.article').find('h4').text();

  loadedCheerio('ul.pager').remove();

  let chapterText = loadedCheerio('div.panel-body.article')
    .html()
    .replace(/<span(.*?)>(.*?)<\/span>/g, '');

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
  const url = `${baseUrl}?search=${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('#table')
    .find('tr')
    .each(function () {
      const novelName = loadedCheerio(this).find('a').text().trim();

      if (novelName) {
        const novelCover = loadedCheerio(this).find('img').attr('src');

        let novelUrl = loadedCheerio(this)
          .find('a')
          .attr('href')
          .replace(baseUrl + 'novel/', '');

        const novel = {
          sourceId,
          novelName,
          novelCover,
          novelUrl,
        };

        novels.push(novel);
      }
    });

  return novels;
};

const WuxiaBlogScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default WuxiaBlogScraper;
