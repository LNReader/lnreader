import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';

const sourceId = 165;
const sourceName = 'Linovelib';

const baseUrl = 'https://w.linovelib.com';

const popularNovels = async page => {
  const url = `${baseUrl}/top/monthvisit/${page}.html`;
  const body = await fetchHtml({ url, sourceId });
  const loadedCheerio = cheerio.load(body);

  const novels = [];

  loadedCheerio('.module-rank-booklist .book-layout').each(function () {
    let novelUrl = loadedCheerio(this).attr('href');

    if (novelUrl) {
      const novelName = loadedCheerio(this).find('.book-title').text();
      const novelCover = loadedCheerio(this)
        .find('img.book-cover')
        .attr('data-src');
      novelUrl = baseUrl + novelUrl;

      const novel = {
        sourceId,
        novelUrl,
        novelName,
        novelCover,
      };

      novels.push(novel);
    }
  });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = novelUrl;
  const body = await fetchHtml({ url, sourceId });
  const loadedCheerio = cheerio.load(body);

  const novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
  };

  novel.name = loadedCheerio('#bookDetailWrapper .book-title').text();

  novel.cover = loadedCheerio('#bookDetailWrapper img.book-cover').attr('src');

  novel.summary = loadedCheerio('#bookSummary content').text();

  novel.author = loadedCheerio('#bookDetailWrapper .book-rand-a a').text();

  novel.artist = null;

  novel.status = loadedCheerio(
    '#bookSummary .notice:first-child .notice-body',
  ).text();

  let genres = [];
  loadedCheerio(
    '#bookDetailWrapper .book-cell .book-meta:last-child .tag-small.red a',
  ).each(function () {
    genres.push(loadedCheerio(this).text());
  });

  if (genres && genres.length > 0) {
    novel.genres = genres.join(', ');
  }

  // Table of Content is on a different page than the summary page
  let chapters = [];

  const idPattern = /\/(\d+)\.html/;
  const novelId = url.match(idPattern)[1];

  const chaptersUrl = baseUrl + loadedCheerio('#btnReadBook').attr('href');
  const chaptersBody = await fetchHtml({ url: chaptersUrl, sourceId });

  const chaptersLoadedCheerio = cheerio.load(chaptersBody);

  let volumeName;

  chaptersLoadedCheerio('#volumes .chapter-li').each(function () {
    if (chaptersLoadedCheerio(this).hasClass('chapter-bar')) {
      volumeName = chaptersLoadedCheerio(this).text();
    } else {
      const urlPart = chaptersLoadedCheerio(this)
        .find('.chapter-li-a')
        .attr('href');
      const chapterIdMatch = urlPart.match(idPattern);

      // Sometimes the href attribute does not contain the url, but javascript:cid(0).
      // Increment the previous chapter ID should result in the right URL
      if (chapterIdMatch) {
        chapterId = chapterIdMatch[1];
      } else {
        chapterId++;
      }

      const chapterUrl = `${baseUrl}/novel/${novelId}/${chapterId}.html`;

      if (chapterUrl) {
        const chapterName =
          volumeName +
          ' — ' +
          chaptersLoadedCheerio(this).find('.chapter-index').text().trim();
        const releaseDate = null;

        chapters.push({
          chapterName,
          releaseDate,
          chapterUrl,
        });
      }
    }
  });

  novel.chapters = chapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;
  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  // Remove JS
  loadedCheerio('#acontent .cgo').remove();

  const chapterName =
    loadedCheerio('#atitle + h3').text() +
    ' — ' +
    loadedCheerio('#atitle').text();
  const chapterText = loadedCheerio('#acontent').html();

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
  const url = `${baseUrl}/search.html?searchkey=` + encodeURI(searchTerm);
  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  const novels = [];

  const loadSearchResults = function () {
    loadedCheerio('.book-ol .book-layout').each(function () {
      let novelUrl = loadedCheerio(this).attr('href');

      if (novelUrl) {
        const novelName = loadedCheerio(this).find('.book-title').text();
        const novelCover = loadedCheerio(this)
          .find('img.book-cover')
          .attr('data-src');
        novelUrl = baseUrl + novelUrl;

        const novel = {
          url: novelUrl,
          name: novelName,
          cover: novelCover,
        };

        novels.push(novel);
      }
    });
  };

  const novelResults = loadedCheerio('.book-ol .book-layout');

  if (novelResults.length === 0) {
    // console.log('Challenge');
  } else {
    loadSearchResults();
  }

  return novels;
};

const LinovelibScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default LinovelibScraper;
