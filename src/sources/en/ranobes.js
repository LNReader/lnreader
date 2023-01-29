import { Status } from '../helpers/constants';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { fetchHtml } from '@utils/fetch/fetch';

const sourceId = 51;
const sourceName = 'Ranobes';

const baseUrl = 'https://ranobes.net';

const popularNovels = async page => {
  let url = `${baseUrl}/novels/page/${page}/`;
  const body = await fetchHtml({ url, sourceId });

  let loadedCheerio = cheerio.load(body);
  const totalPages = parseInt(
    loadedCheerio('.pages > a:last-child').text() || '200',
    10,
  );
  let novels = [];

  loadedCheerio('article.block.story.shortstory.mod-poster').each(function () {
    const novelName = loadedCheerio(this).find('h2.title').text();
    let novelCover = loadedCheerio(this).find('figure').attr('style');
    let novelUrl = loadedCheerio(this).find('h2.title a').attr('href');

    novelCover = novelCover
      .match(/background-image: url(.*);/)[1]
      .slice(1, -1)
      .replace('/thumbs/', '/');

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
  const body = await fetchHtml({ url: novelUrl, sourceId });

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    novelUrl,
    url: novelUrl,
  };

  novel.novelName = loadedCheerio('meta[property="og:title"]').attr('content');

  novel.novelCover = baseUrl + loadedCheerio('.poster > a > img').attr('src');

  novel.summary = loadedCheerio('div[id="fs-info"] div[class="moreless__full"]')
    .text()
    .trim();

  novel.author = loadedCheerio('span[class="tag_list"] > a').text();

  novel.status =
    loadedCheerio(
      '#fs-info > div.r-fullstory-spec > ul:nth-child(1) > li:nth-child(1) > span > a',
    ).text() === 'Ongoing'
      ? Status.ONGOING
      : Status.COMPLETED;

  let tags =
    loadedCheerio('#mc-fs-genre > div:nth-child(1)').text().trim() +
    ', ' +
    loadedCheerio(
      '#mc-fs-keyw > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)',
    )
      .text()
      .trim();

  novel.genre = tags.replace(/, /g, ',');

  let chapterListUrl = loadedCheerio(
    'div.r-fullstory-chapters-foot a[title~=contents]',
  ).attr('href');

  if (!chapterListUrl?.startsWith('http')) {
    chapterListUrl = baseUrl + chapterListUrl;
  }

  const chaptersHtmlToString = await fetchHtml({
    url: chapterListUrl,
    sourceId,
  });

  loadedCheerio = cheerio.load(chaptersHtmlToString);
  let json = loadedCheerio('#dle-content > script:nth-child(3)').html();
  let data = JSON.parse(json.replace('window.__DATA__ =', ''));

  let novelChapters = [];

  for (i = 0; i < data.pages_count; i++) {
    if (i > 0) {
      let chapterHtmlToString = await fetchHtml({
        url: chapterListUrl + 'page/' + (i + 1),
        sourceId,
      });
      loadedCheerio = cheerio.load(chapterHtmlToString);
      json = loadedCheerio('#dle-content > script:nth-child(3)').html();
      data = JSON.parse(json.replace('window.__DATA__ =', ''));
    }

    data.chapters.forEach(chapter => {
      novelChapters.push({
        chapterName: chapter.title,
        releaseDate: dayjs(chapter.date).format('LLL'),
        chapterUrl: chapter.link,
      });
    });
  }
  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const body = await fetchHtml({ url: chapterUrl, sourceId });
  const loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('h1.title').text();
  let chapterText = loadedCheerio('#arrticle').html();

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
  let url = `${baseUrl}/index.php?story=${searchTerm}&do=search&subaction=search`;

  const body = await fetchHtml({ url, sourceId });

  let loadedCheerio = cheerio.load(body);
  let novels = [];

  loadedCheerio('article.block.story.shortstory.mod-poster').each(function () {
    const novelName = loadedCheerio(this).find('h2.title').text();
    let novelCover = loadedCheerio(this).find('figure').attr('style');
    let novelUrl = loadedCheerio(this).find('h2.title a').attr('href');

    novelCover = novelCover
      .match(/background-image: url(.*);/)[1]
      .slice(1, -1)
      .replace('/thumbs/', '/');

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

const RanobesScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default RanobesScraper;
