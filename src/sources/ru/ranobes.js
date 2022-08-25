import { Status } from '../helpers/constants';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';

const sourceId = 132;
const sourceName = 'Ranobes';

const baseUrl = 'https://ranobes.com';

const popularNovels = async page => {
  let url = `${baseUrl}/ranobe/page/${page}/`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);
  const totalPages = parseInt(
    loadedCheerio('.pages > a:last-child').text() || '30',
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
  const result = await fetch(novelUrl);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    novelUrl,
    url: novelUrl,
  };

  novel.novelName = loadedCheerio('meta[property="og:title"]').attr('content');

  novel.novelCover = baseUrl + loadedCheerio('.poster > a > img').attr('src');

  novel.summary = loadedCheerio('div[itemprop="description"]').text().trim();

  novel.author = loadedCheerio('span[class="tag_list"] > a').text();

  novel.status =
    loadedCheerio(
      '#fs-info > div.r-fullstory-spec > ul:nth-child(1) > li:nth-child(4) > span > a',
    ).text() === 'В процессе'
      ? Status.ONGOING
      : Status.COMPLETED;

  let tags =
    loadedCheerio('div[itemprop="genre"]').text().trim() +
    ', ' +
    loadedCheerio('div[itemprop="keywords"]').text().trim();

  novel.genre = tags.replace(/, /g, ',');

  let chapterListUrl = loadedCheerio(
    'div.r-fullstory-btns a[title~=оглавление]',
  ).attr('href');

  if (!chapterListUrl?.startsWith('http')) {
    chapterListUrl = baseUrl + chapterListUrl;
  }

  const chaptersHtml = await fetch(chapterListUrl);
  const chaptersHtmlToString = await chaptersHtml.text();

  loadedCheerio = cheerio.load(chaptersHtmlToString);
  let novelChapters = [];

  let all = loadedCheerio('div.pages a:last-child').text();
  all = parseInt(all || '1', 10);

  for (i = 0; i < all; i++) {
    if (i > 0) {
      let chapterHtml = await fetch(chapterListUrl + 'page/' + (i + 1));
      let chapterHtmlToString = await chapterHtml.text();
      loadedCheerio = cheerio.load(chapterHtmlToString);
    }

    loadedCheerio('div[class="cat_block cat_line"] a').each(function () {
      let date = loadedCheerio(this).find('span > small').text();
      let timeAgo = date.match(/\d+/);

      if (date.includes('Сегодня')) {
        date = dayjs().hour(timeAgo[0]).minute(timeAgo[1]).format('LLL');
      } else if (date.includes('Вчера')) {
        date = dayjs()
          .subtract(1, 'day')
          .hour(timeAgo[0])
          .minute(timeAgo[1])
          .format('LLL');
      }

      novelChapters.push({
        chapterName: loadedCheerio(this).attr('title'),
        releaseDate: date.replace(' в ', ' г., '),
        chapterUrl: loadedCheerio(this).attr('href'),
      });
    });
  }
  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(chapterUrl);
  const body = await result.text();
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

  const result = await fetch(url);
  const body = await result.text();

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
