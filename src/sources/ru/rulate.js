import * as cheerio from 'cheerio';
import { Status } from '../helpers/constants';

const sourceId = 118;
const sourceName = 'Rulate';

const baseUrl = 'https://tl.rulate.ru';

const popularNovels = async page => {
  const result = await fetch(baseUrl + '/site/login?page=' + page);
  const body = await result.text();
  const loadedCheerio = cheerio.load(body);
  const totalPages = parseInt(
    loadedCheerio('li[class="last"] > a').attr('href')?.replace(/[^\d]/g, '') ||
      '250',
    10,
  );
  let novels = [];

  loadedCheerio('.imged > li').each(function () {
    const novelName = loadedCheerio(this).find('p > a').text();
    const novelCover =
      baseUrl + loadedCheerio(this).find('div').attr('style').split("'")[1];
    const novelUrl = loadedCheerio(this).find('p > a').attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };
    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  let result = await fetch(baseUrl + novelUrl);
  if (result.url.includes('mature?path=')) {
    const formData = new FormData();
    formData.append('path', novelUrl);
    formData.append('ok', 'Да');

    await fetch(result.url, {
      method: 'POST',
      body: formData,
    });

    result = await fetch(baseUrl + novelUrl);
  }
  const body = await result.text();
  const loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url: baseUrl + novelUrl,
    novelUrl,
  };

  novel.novelName = loadedCheerio('div[class="container"] > div > div > h1')
    .text()
    .trim();
  novel.novelCover =
    baseUrl + loadedCheerio('div[class="images"] > div img').attr('src');
  novel.summary = loadedCheerio('#Info > div:nth-child(3)').text().trim();
  novel.genre = [];

  let chapters = [];

  loadedCheerio('div[class="span5"] > p').each(function () {
    switch (loadedCheerio(this).find('strong').text()) {
      case 'Автор:':
        novel.author = loadedCheerio(this).find('em > a').text().trim();
        break;
      case 'Выпуск:':
        novel.status =
          loadedCheerio(this).find('em').text().trim() === 'продолжается'
            ? Status.ONGOING
            : Status.COMPLETED;
        break;
      case 'Тэги:':
        loadedCheerio(this)
          .find('em > a')
          .each(function () {
            novel.genre.push(loadedCheerio(this).text());
          });
        break;
      case 'Жанры:':
        loadedCheerio(this)
          .find('em > a')
          .each(function () {
            novel.genre.push(loadedCheerio(this).text());
          });
        break;
    }
  });

  if (novel.genre.length > 0) {
    novel.genre = novel.genre.reverse().join(',');
  } else {
    novel.genre = '';
  }

  loadedCheerio('table > tbody > tr.chapter_row').each(function () {
    const chapterName = loadedCheerio(this)
      .find('td[class="t"] > a')
      .text()
      .trim();
    const releaseDate = null;
    const chapterUrl = loadedCheerio(this)
      .find('td[class="t"] > a')
      .attr('href');

    if (loadedCheerio(this).find('td > span[class="disabled"]').length < 1) {
      chapters.push({ chapterName, releaseDate, chapterUrl });
    }
  });

  novel.chapters = chapters;
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  let result = await fetch(baseUrl + chapterUrl);
  if (result.url.includes('mature?path=')) {
    const formData = new FormData();
    formData.append('path', novelUrl);
    formData.append('ok', 'Да');

    await fetch(result.url, {
      method: 'POST',
      body: formData,
    });

    result = await fetch(baseUrl + chapterUrl);
  }
  const body = await result.text();
  const loadedCheerio = cheerio.load(body);

  loadedCheerio('.content-text img').each(function () {
    if (!loadedCheerio(this).attr('src')?.startsWith('http')) {
      const src = loadedCheerio(this).attr('src');
      loadedCheerio(this).attr('src', baseUrl + src);
    }
  });

  const chapterName = loadedCheerio(
    '.chapter_select > select > option[selected]',
  )
    .text()
    .trim();
  const chapterText = loadedCheerio('.content-text').html();

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
  const result = await fetch(
    baseUrl + '/search/autocomplete?query=' + searchTerm,
  );
  let json = await result.json();
  let novels = [];

  json.map(item => {
    const novelName = item.title_one + ' / ' + item.title_two;
    const novelCover = baseUrl + item.img;
    const novelUrl = item.url;

    novels.push({ sourceId, novelName, novelCover, novelUrl });
  });

  return novels;
};

const RulateLibScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default RulateLibScraper;
