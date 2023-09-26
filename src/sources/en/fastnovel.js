import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';

const sourceId = 3;
const baseUrl = 'https://fastnovel.org';
const searchUrl = 'https://fastnovel.org/search/';

const popularNovels = async page => {
  const url = `${baseUrl}/sort/p/?page=${page}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.col-novel-main .list-novel .row').each(function () {
    const novelName = loadedCheerio(this).find('h3.novel-title > a').text();
    const novelCover = loadedCheerio(this).find('img.cover').attr('src');
    const novelUrl = loadedCheerio(this)
      .find('h3.novel-title > a')
      .attr('href');

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
  const url = `${novelUrl}/`;
  const body = await fetchHtml({ url, sourceId });

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName: 'FastNovel',
    url,
    novelUrl,
  };

  novel.novelName = loadedCheerio('div.book > img').attr('alt');

  novel.novelCover = loadedCheerio('div.book > img').attr('src');

  novel.summary = loadedCheerio('div.desc-text').text().trim();

  loadedCheerio('ul.info > li > h3').each(function () {
    let detailName = loadedCheerio(this).text();
    let detail = loadedCheerio(this)
      .siblings()
      .map((i, el) => loadedCheerio(el).text())
      .toArray()
      .join(',');

    switch (detailName) {
      case 'Author:':
        novel.author = detail;
        break;
      case 'Status:':
        novel.status = detail;
        break;
      case 'Genre:':
        novel.genre = detail;
        break;
    }
  });
  const novelId = loadedCheerio('#rating').attr('data-novel-id');

  const getChapters = async id => {
    const chapterListUrl = baseUrl + '/ajax/chapter-archive?novelId=' + id;

    const chapters = await fetchHtml({ url: chapterListUrl, sourceId });

    loadedCheerio = cheerio.load(chapters);

    let novelChapters = [];

    loadedCheerio('.list-chapter > li').each(function () {
      let chapterName = loadedCheerio(this).find('span').text();
      let releaseDate = null;
      let chapterUrl = loadedCheerio(this).find('a').attr('href');

      if (chapterUrl) {
        novelChapters.push({
          chapterName,
          releaseDate,
          chapterUrl,
        });
      }
    });

    return novelChapters;
  };

  if (novelId) {
    novel.chapters = await getChapters(novelId);
  }

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${chapterUrl}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.chr-text').text();

  loadedCheerio('#chr-content > div,h6,p[style="display: none;"]').remove();
  let chapterText = loadedCheerio('#chr-content').html();
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
  const url = searchUrl + '?keyword=' + searchTerm;
  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.col-novel-main .list-novel .row').each(function () {
    const novelName = loadedCheerio(this).find('h3.novel-title > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this)
      .find('h3.novel-title > a')
      .attr('href');

    if (novelUrl) {
      novels.push({
        sourceId,
        novelUrl,
        novelName,
        novelCover,
      });
    }
  });

  return novels;
};

const fastNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default fastNovelScraper;
