import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';
class WPMangaStreamScraper {
  constructor(sourceId, baseUrl, sourceName, options) {
    this.sourceId = sourceId;
    this.baseUrl = baseUrl;
    this.sourceName = sourceName;
    this.language = options?.language;
    this.totalPages = options?.totalPages;
  }

  async popularNovels(page) {
    let totalPages = this.totalPages;
    let url = this.baseUrl + 'series/?page=' + page + '&status=&order=popular';
    let sourceId = this.sourceId;

    const body = await fetchHtml({ url, sourceId });

    const loadedCheerio = cheerio.load(body);

    let novels = [];

    loadedCheerio('article.bs').each(function () {
      const novelName = loadedCheerio(this).find('.ntitle').text().trim();
      let image = loadedCheerio(this).find('img');
      const novelCover = image.attr('src');

      const novelUrl = loadedCheerio(this).find('a').attr('href');

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

    const body = await fetchHtml({ url, sourceId: this.sourceId });

    let loadedCheerio = cheerio.load(body);

    let novel = {};

    novel.sourceId = this.sourceId;

    novel.sourceName = this.sourceName;

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = loadedCheerio('.entry-title').text();

    novel.novelCover = loadedCheerio('img.wp-post-image').attr('src');

    loadedCheerio('div.spe > span').each(function () {
      const detailName = loadedCheerio(this).find('b').text().trim();
      const detail = loadedCheerio(this).find('b').next().text().trim();

      switch (detailName) {
        case 'المؤلف:':
        case 'Yazar:':
        case 'Autor:':
          novel.author = detail;
          break;
        case 'Status:':
        case 'Seviye:':
          novel.status = detail;
          break;
        case 'Tipo:':
        case 'Tür:':
          novel.genre = detail?.replace(/\s/g, ',');
          break;
      }
    });

    novel.summary = loadedCheerio('div[itemprop="description"]').text().trim();

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

    return novel;
  }

  async parseChapter(novelUrl, chapterUrl) {
    let sourceId = this.sourceId;

    const url = chapterUrl;

    const body = await fetchHtml({ url, sourceId });

    const loadedCheerio = cheerio.load(body);

    let chapterName = loadedCheerio('.entry-title').text();
    let chapterText = loadedCheerio('div.epcontent').html();

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

    loadedCheerio('article.bs').each(function () {
      const novelName = loadedCheerio(this).find('.ntitle').text().trim();
      const novelCover = loadedCheerio(this).find('img').attr('src');
      const novelUrl = loadedCheerio(this).find('a').attr('href');

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

module.exports = WPMangaStreamScraper;
