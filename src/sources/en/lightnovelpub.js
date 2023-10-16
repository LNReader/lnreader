import { fetchApi, fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';
const sourceId = 15;
const baseUrl = 'https://www.lightnovelpub.com/';

const headers = new Headers({
  Accept: 'application/json',
  'Content-Type': 'application/json',
});

const popularNovels = async page => {
  const url = baseUrl + 'browse/all/popular/all/' + page;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.novel-item.ads').remove();

  loadedCheerio('.novel-item').each(function () {
    const novelName = loadedCheerio(this).find('.novel-title').text().trim();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');
    const novelUrl =
      baseUrl +
      loadedCheerio(this).find('.novel-title > a').attr('href').substring(1);

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
  const url = novelUrl;

  const body = await fetchHtml({ url, sourceId });

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    url: novelUrl,
    novelUrl,
    sourceName: 'LightNovelPub',
  };

  novel.novelName = loadedCheerio('h1.novel-title').text().trim();

  novel.novelCover = loadedCheerio('figure.cover > img').attr('data-src');

  novel.genre = loadedCheerio('.categories li')
    .find('a')
    .map((i, el) => loadedCheerio(el).text())
    .toArray()
    .join(',');

  novel.status = loadedCheerio('small:contains("Status")').prev().text().trim();

  novel.author = loadedCheerio('.author > a > span').text();

  loadedCheerio('.expand').remove();
  novel.summary = loadedCheerio('.summary > .content').text().trim();

  const delay = ms => new Promise(res => setTimeout(res, ms));

  let lastPage = 1;

  lastPage = loadedCheerio('small:contains("Chapters")').prev().text().trim();

  lastPage = Math.ceil(lastPage / 100);

  const getChapters = async () => {
    let novelChapters = [];

    for (let i = 1; i <= lastPage; i++) {
      const chaptersUrl = `${novelUrl}/chapters/page-${i}`;

      const chaptersHtml = await fetchHtml({
        url: chaptersUrl,
        init: { headers },
        sourceId,
      });

      loadedCheerio = cheerio.load(chaptersHtml);

      loadedCheerio('.chapter-list li').each(function () {
        const chapterName = loadedCheerio(this)
          .find('.chapter-title')
          .text()
          .trim();

        const releaseDate = loadedCheerio(this)
          .find('.chapter-update')
          .text()
          .trim();

        const chapterUrl =
          baseUrl + loadedCheerio(this).find('a').attr('href').substring(1);

        novelChapters.push({ chapterName, releaseDate, chapterUrl });
      });

      await delay(1000);
    }

    return novelChapters;
  };

  novel.chapters = await getChapters();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;
  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h2').text();
  const chapterText = loadedCheerio('#chapter-container').html();

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
  const url = `${baseUrl}lnsearchlive`;
  const link = `${baseUrl}search`;
  const response = await fetchApi({ url: link, sourceId }).then(r => r.text());
  const token = cheerio.load(response);
  let verifytoken = token('#novelSearchForm > input').attr('value');

  let formData = new FormData();
  formData.append('inputContent', searchTerm);

  const body = await fetchHtml({
    url,
    init: {
      method: 'POST',
      headers: { 'LNRequestVerifyToken': verifytoken },
      body: formData,
    },
    sourceId,
  });

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  let results = JSON.parse(loadedCheerio('body').text());

  loadedCheerio = cheerio.load(results.resultview);

  loadedCheerio('.novel-item').each(function () {
    const novelName = loadedCheerio(this).find('h4.novel-title').text().trim();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl =
      baseUrl + loadedCheerio(this).find('a').attr('href').substring(1);

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

const lightNovelPubScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default lightNovelPubScraper;
