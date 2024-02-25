import { Status } from '../../helpers/constants';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';

class IfreedomScraper {
  constructor(sourceId, baseUrl, sourceName, filters) {
    this.sourceId = sourceId;
    this.baseUrl = baseUrl;
    this.sourceName = sourceName;
    this.filters = filters;
  }

  async popularNovels(page, { showLatestNovels, filters }) {
    let url =
      this.baseUrl +
      '/vse-knigi/?sort=' +
      (showLatestNovels
        ? 'По дате обновления'
        : filters?.sort || 'По рейтингу');

    Object.entries(filters || {}).forEach(([type, value]) => {
      if (value instanceof Array && value.length) {
        url += '&' + type + '[]=' + value.join('&' + type + '[]=');
      }
    });

    url += '&bpage=' + page;

    const body = await fetch(url).then(res => res.text());
    const loadedCheerio = cheerio.load(body);

    const novels = loadedCheerio('div.one-book-home > div.img-home a')
      .map((index, element) => ({
        sourceId: this.sourceId,
        novelName: loadedCheerio(element).attr('title'),
        novelCover: loadedCheerio(element).find('img').attr('src'),
        novelUrl: loadedCheerio(element).attr('href'),
      }))
      .get()
      .filter(novel => novel.novelName && novel.novelUrl);

    return { novels };
  }

  async parseNovelAndChapters(novelUrl) {
    const body = await fetch(novelUrl).then(res => res.text());
    const loadedCheerio = cheerio.load(body);

    const novel = {
      sourceId: this.sourceId,
      sourceName: this.sourceName,
      url: novelUrl,
      novelUrl,
      novelName: loadedCheerio('.entry-title').text(),
      novelCover: loadedCheerio('.img-ranobe > img').attr('src'),
      summary: loadedCheerio('meta[name="description"]').attr('content'),
    };

    loadedCheerio('div.data-ranobe').each(function () {
      switch (loadedCheerio(this).find('b').text()) {
        case 'Автор':
          novel.author = loadedCheerio(this)
            .find('div.data-value')
            .text()
            .trim();
          break;
        case 'Жанры':
          novel.genre = loadedCheerio('div.data-value > a')
            .map((index, element) => loadedCheerio(element).text()?.trim())
            .get()
            .join(',');
          break;
        case 'Статус книги':
          novel.status = loadedCheerio('div.data-value')
            .text()
            .includes('активен')
            ? Status.ONGOING
            : Status.COMPLETED;
          break;
      }
    });

    if (novel.author === 'Не указан') {
      delete novel.author;
    }

    const chapters = [];
    loadedCheerio('div.li-ranobe').each(function () {
      const chapterName = loadedCheerio(this).find('a').text();
      const chapterUrl = loadedCheerio(this).find('a').attr('href');
      if (
        !loadedCheerio(this).find('label.buy-ranobe').length &&
        chapterName &&
        chapterUrl
      ) {
        const releaseTime = loadedCheerio(this)
          .find('div.li-col2-ranobe')
          .text()
          .trim();

        chapters.push({
          chapterName,
          releaseDate: parseDate(releaseTime),
          chapterUrl,
        });
      }
    });

    novel.chapters = chapters.reverse();
    return novel;
  }

  async parseChapter(novelUrl, chapterUrl) {
    const body = await fetch(chapterUrl).then(res => res.text());
    const loadedCheerio = cheerio.load(body);

    loadedCheerio('.entry-content img').each(function () {
      const srcset = loadedCheerio(this).attr('srcset')?.split?.(' ');
      if (srcset?.length) {
        const bestlink = srcset
          .filter(url => url.startsWith('http'))
          ?.unshift();
        if (bestlink) {
          loadedCheerio(this).attr('src', bestlink);
        }
      }
    });

    const chapter = {
      sourceId: this.sourceId,
      novelUrl,
      chapterUrl,
      chapterName: loadedCheerio('.entry-title').text(),
      chapterText: loadedCheerio('.entry-content').html(),
    };

    return chapter;
  }

  async searchNovels(searchTerm) {
    const url = this.baseUrl + '/vse-knigi/?searchname=' + searchTerm;
    const result = await fetch(url).then(res => res.text());
    const loadedCheerio = cheerio.load(result);

    const novels = loadedCheerio('div.one-book-home > div.img-home a')
      .map((index, element) => ({
        sourceId: this.sourceId,
        novelName: loadedCheerio(element).attr('title'),
        novelCover: loadedCheerio(element).find('img').attr('src'),
        novelUrl: loadedCheerio(element).attr('href'),
      }))
      .get()
      .filter(novel => novel.novelName && novel.novelUrl);

    return novels;
  }
}

function parseDate(dateString = '') {
  const months = {
    января: 1,
    февраля: 2,
    марта: 3,
    апреля: 4,
    мая: 5,
    июня: 6,
    июля: 7,
    августа: 8,
    сентября: 9,
    октября: 10,
    ноября: 11,
    декабря: 12,
  };

  if (dateString.includes('.')) {
    const [day, month, year] = dateString.split('.');
    if (day && month && year) {
      return dayjs(year + '-' + month + '-' + day).format('LL');
    }
  } else if (dateString.includes(' ')) {
    const [day, month] = dateString.split(' ');
    if (day && months[month]) {
      const year = new Date().getFullYear();
      return dayjs(year + '-' + months[month] + '-' + day).format('LL');
    }
  }
  return dateString;
}

export default IfreedomScraper;
