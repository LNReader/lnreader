import * as cheerio from 'cheerio';
class WPMangaStreamScraper {
  constructor(sourceId, baseUrl, sourceName) {
    this.sourceId = sourceId;
    this.baseUrl = baseUrl;
    this.sourceName = sourceName;
  }

  async popularNovels(page) {
    let totalPages = 100;
    let url = this.baseUrl + 'series/?page=' + page + '&status=&order=popular';
    let sourceId = this.sourceId;

    const result = await fetch(url);
    const body = await result.text();

    const loadedCheerio = cheerio.load(body);

    let novels = [];

    loadedCheerio('article.bs').each(function () {
      const novelName = loadedCheerio(this).find('.ntitle').text().trim();
      let image = loadedCheerio(this).find('img');
      const novelCover = image.attr('src');

      let novelUrl = loadedCheerio(this).find('a').attr('href').split('/')[4];

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
    const url = `${this.baseUrl}series/${novelUrl}/`;

    const result = await fetch(url);
    const body = await result.text();

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

      if (loadedCheerio(this).text().includes('الحالة:')) {
        novel.status = loadedCheerio(this).text().replace('الحالة: ', '');
      }

      switch (detailName) {
        case 'المؤلف:':
          novel.auhtor = detail;
          break;
      }
    });

    novel.genre = loadedCheerio('.genxed').text().replace(/\s/g, ',');

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

        const chapterUrl = loadedCheerio(this)
          .find('a')
          .attr('href')
          .split('/')[3];

        novelChapters.push({ chapterName, releaseDate, chapterUrl });
      });

    novel.chapters = novelChapters.reverse();

    return novel;
  }

  async parseChapter(novelUrl, chapterUrl) {
    let sourceId = this.sourceId;

    const url = `${this.baseUrl}${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

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

    const result = await fetch(url);
    const body = await result.text();

    const loadedCheerio = cheerio.load(body);

    let novels = [];
    let sourceId = this.sourceId;

    loadedCheerio('article.bs').each(function () {
      const novelName = loadedCheerio(this).find('.ntitle').text().trim();
      let image = loadedCheerio(this).find('img');
      const novelCover = image.attr('src');

      let novelUrl = loadedCheerio(this).find('a').attr('href').split('/')[4];

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
