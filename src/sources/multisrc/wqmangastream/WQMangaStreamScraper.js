import * as cheerio from 'cheerio';
import { fetchHtml } from '@utils/fetch/fetch';

class WQMangaStreamScraper {
  constructor(sourceId, baseUrl, sourceName, options) {
    this.sourceId = sourceId;
    this.baseUrl = baseUrl;
    this.sourceName = sourceName;
    this.language = options?.language;
    this.totalPages = options?.totalPages;
    this.reverseChapters = options?.reverseChapters;
  }

  async popularNovels(page) {
    let totalPages = this.totalPages;
    let url = this.baseUrl + 'series/?page=' + page + '&status=&order=popular';
    let sourceId = this.sourceId;

    const body = await fetchHtml({ url, sourceId });

    const loadedCheerio = cheerio.load(body);

    let novels = [];

    loadedCheerio('article.maindet').each(function () {
      const novelName = loadedCheerio(this).find('h2').text();
      let image = loadedCheerio(this).find('img');
      const novelCover = image.attr('data-src') || image.attr('src');
      const novelUrl = loadedCheerio(this).find('h2 a').attr('href');

      const novel = {
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    });

    return { totalPages, novels };
  }

  async parseNovelAndChapters(novelUrl) {
    const url = novelUrl;
    let sourceId = this.sourceId;

    const body = await fetchHtml({ url, sourceId });

    let loadedCheerio = cheerio.load(body);

    let novel = {};

    novel.sourceId = this.sourceId;

    novel.sourceName = this.sourceName;

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = loadedCheerio('h1.entry-title').text();

    novel.novelCover =
      loadedCheerio('img.wp-post-image').attr('data-src') ||
      loadedCheerio('img.wp-post-image').attr('src');

    novel.status = loadedCheerio('div.sertostat > span').text().trim();

    loadedCheerio('div.serl:nth-child(3) > span').each(function () {
      const detailName = loadedCheerio(this).text().trim();
      const detail = loadedCheerio(this).next().prop('innerHTML');

      switch (detailName) {
        case 'الكاتب':
        case 'Author':
          novel.author = detail.replace(/<a.*?>(.*?)<.*?>/g, '$1');
          break;
      }
    });

    novel.genre = loadedCheerio('.sertogenre')
      .prop('innerHTML')
      .replace(/<a.*?>(.*?)<.*?>/g, '$1,')
      .slice(0, -1);

    novel.summary = loadedCheerio('.sersys')
      .prop('innerHTML')
      .replace(/(<.*?>)/g, '')
      .replace(/(&.*;)/g, '\n');

    let novelChapters = [];

    loadedCheerio('.eplister')
      .find('li')
      .each(function () {
        const chapterName =
          loadedCheerio(this).find('.epl-num').text() +
          ' - ' +
          loadedCheerio(this).find('.epl-title').text();

        const releaseDate = loadedCheerio(this).find('.epl-date').text().trim();

        const chapterUrl = loadedCheerio(this).find('a').attr('href');

        novelChapters.push({ chapterName, releaseDate, chapterUrl });
      });

    novel.chapters = novelChapters;

    if (this.reverseChapters) {
      novel.chapters.reverse();
    }

    return novel;
  }

  async parseChapter(novelUrl, chapterUrl) {
    let sourceId = this.sourceId;

    const url = chapterUrl;

    const body = await fetchHtml({ url, sourceId });

    const loadedCheerio = cheerio.load(body);

    let chapterName = loadedCheerio('.entry-title').text();
    let chapterText = loadedCheerio('.epcontent').html();

    const chapter = {
      sourceId,
      novelUrl,
      chapterUrl,
      chapterName,
      chapterText,
    };

    return chapter;
  }

  async searchNovels(searchTerm) {
    const url = `${this.baseUrl}?s=${searchTerm}`;
    const sourceId = this.sourceId;

    const body = await fetchHtml({ url, sourceId });

    const loadedCheerio = cheerio.load(body);

    let novels = [];

    loadedCheerio('article.maindet').each(function () {
      const novelName = loadedCheerio(this).find('h2').text();
      let image = loadedCheerio(this).find('img');
      const novelCover = image.attr('data-src') || image.attr('src');
      const novelUrl = loadedCheerio(this).find('h2 a').attr('href');

      const novel = {
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    });

    return novels;
  }
}

module.exports = WQMangaStreamScraper;
