import { showToast } from '@hooks/showToast';
import { fetchApi, fetchHtml } from '@utils/fetch/fetch';

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

  novel.novelName = loadedCheerio('#bookDetailWrapper .book-title').text();

  novel.novelCover = loadedCheerio('#bookDetailWrapper img.book-cover').attr(
    'src',
  );

  novel.summary = loadedCheerio('#bookSummary content').text();

  novel.author = loadedCheerio('#bookDetailWrapper .book-rand-a a').text();

  novel.artist = null;

  // TODO: Need some regex and dirty selector to get it
  // Need to look into how to translate that message
  novel.status = null;

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
  let chapterName, chapterText, hasNextPage, pageHasNextPage, pageText;
  let pageNumber = 1;

  /*
   * TODO: Maybe there are other ways to get the translation table
   * It is embed and encrypted inside readtool.js
   * UPDATE: Decrypted, by skillgg
   */

  const mapping_dict = {
    '\u201c': '\u300c',
    '\u201d': '\u300d',
    '\u2018': '\u300e',
    '\u2019': '\u300f',
    '\ue82c': '\u7684',
    '\ue852': '\u4e00',
    '\ue82d': '\u662f',
    '\ue819': '\u4e86',
    '\ue856': '\u6211',
    '\ue857': '\u4e0d',
    '\ue816': '\u4eba',
    '\ue83c': '\u5728',
    '\ue830': '\u4ed6',
    '\ue82e': '\u6709',
    '\ue836': '\u8fd9',
    '\ue859': '\u4e2a',
    '\ue80a': '\u4e0a',
    '\ue855': '\u4eec',
    '\ue842': '\u6765',
    '\ue858': '\u5230',
    '\ue80b': '\u65f6',
    '\ue81f': '\u5927',
    '\ue84a': '\u5730',
    '\ue853': '\u4e3a',
    '\ue81e': '\u5b50',
    '\ue822': '\u4e2d',
    '\ue813': '\u4f60',
    '\ue85b': '\u8bf4',
    '\ue807': '\u751f',
    '\ue818': '\u56fd',
    '\ue810': '\u5e74',
    '\ue812': '\u7740',
    '\ue851': '\u5c31',
    '\ue801': '\u90a3',
    '\ue80c': '\u548c',
    '\ue815': '\u8981',
    '\ue84c': '\u5979',
    '\ue840': '\u51fa',
    '\ue848': '\u4e5f',
    '\ue835': '\u5f97',
    '\ue800': '\u91cc',
    '\ue826': '\u540e',
    '\ue863': '\u81ea',
    '\ue861': '\u4ee5',
    '\ue854': '\u4f1a',
    '\ue827': '\u5bb6',
    '\ue83b': '\u53ef',
    '\ue85d': '\u4e0b',
    '\ue84d': '\u800c',
    '\ue862': '\u8fc7',
    '\ue81c': '\u5929',
    '\ue81d': '\u53bb',
    '\ue860': '\u80fd',
    '\ue843': '\u5bf9',
    '\ue82f': '\u5c0f',
    '\ue802': '\u591a',
    '\ue831': '\u7136',
    '\ue84b': '\u4e8e',
    '\ue837': '\u5fc3',
    '\ue829': '\u5b66',
    '\ue85e': '\u4e48',
    '\ue83a': '\u4e4b',
    '\ue832': '\u90fd',
    '\ue808': '\u597d',
    '\ue841': '\u770b',
    '\ue821': '\u8d77',
    '\ue845': '\u53d1',
    '\ue803': '\u5f53',
    '\ue828': '\u6ca1',
    '\ue81b': '\u6210',
    '\ue83e': '\u53ea',
    '\ue820': '\u5982',
    '\ue84e': '\u4e8b',
    '\ue85a': '\u628a',
    '\ue806': '\u8fd8',
    '\ue83f': '\u7528',
    '\ue833': '\u7b2c',
    '\ue811': '\u6837',
    '\ue804': '\u9053',
    '\ue814': '\u60f3',
    '\ue80f': '\u4f5c',
    '\ue84f': '\u79cd',
    '\ue80e': '\u5f00',
    '\ue823': '\u7f8e',
    '\ue849': '\u4e73',
    '\ue805': '\u9634',
    '\ue809': '\u6db2',
    '\ue81a': '\u830e',
    '\ue844': '\u6b32',
    '\ue847': '\u547b',
    '\ue850': '\u8089',
    '\ue824': '\u4ea4',
    '\ue85f': '\u6027',
    '\ue817': '\u80f8',
    '\ue85c': '\u79c1',
    '\ue838': '\u7a74',
    '\ue82a': '\u6deb',
    '\ue83d': '\u81c0',
    '\ue82b': '\u8214',
    '\ue80d': '\u5c04',
    '\ue839': '\u8131',
    '\ue834': '\u88f8',
    '\ue846': '\u9a9a',
    '\ue825': '\u5507',
  };

  const addPage = async pageCheerio => {
    const formatPage = async () => {
      // Remove JS
      pageCheerio('.atitle').next().find('.cgo').remove();

      // Load lazyloaded images
      pageCheerio('.atitle')
        .next()
        .find('img.imagecontent')
        .each(function () {
          // Sometimes images are either in data-src or src
          const imgSrc =
            pageCheerio(this).attr('data-src') || pageCheerio(this).attr('src');
          if (imgSrc) {
            // The original CDN URL is locked behind a CF-like challenge, switch the URL to bypass that
            // There are no react-native-url-polyfill lib, can't use URL API
            const regex = /\/\/.+\.com\//;
            const imgUrl = imgSrc.replace(regex, '//img.linovelib.com/');
            // Clean up img element
            pageCheerio(this)
              .attr('src', imgUrl)
              .removeAttr('data-src')
              .removeClass('lazyload')
              .addClass('delayed-src');
          }
        });

      // Recover the original character
      pageText = pageCheerio('.atitle').next().html();
      pageText = pageText?.replace(/./g, char => mapping_dict[char] || char);

      return Promise.resolve();
    };

    await formatPage();
    chapterName =
      pageCheerio('#atitle + h3').text() +
      ' — ' +
      pageCheerio('#atitle').text();
    if (chapterText === undefined) {
      chapterText = '<h2>' + chapterName + '</h2>';
    }
    chapterText += pageText;
  };

  const loadPage = async url => {
    const body = await fetchHtml({ url, sourceId });
    const pageCheerio = cheerio.load(body);
    await addPage(pageCheerio);
    pageHasNextPage =
      pageCheerio('#footlink a:last').text() === '下一页' ? true : false;
    return { pageCheerio, pageHasNextPage };
  };

  let url = chapterUrl;
  do {
    const page = await loadPage(url);
    hasNextPage = page.pageHasNextPage;
    if (hasNextPage === true) {
      pageNumber++;
      url = chapterUrl.replace(/\.html/gi, `_${pageNumber}` + '.html');
    }
  } while (hasNextPage === true);

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
  const searchUrl = `${baseUrl}/search/`;
  const Term = encodeURI(searchTerm);
  let nextPage, noNextPage, deadEnd;
  let pageNumber = 1;
  const novels = [];

  const addPage = async (pageCheerio, redirect) => {
    const loadSearchResults = function () {
      pageCheerio('.book-ol .book-layout').each(function () {
        let novelUrl = pageCheerio(this).attr('href');

        if (novelUrl) {
          const novelName = pageCheerio(this).find('.book-title').text();
          const novelCover = pageCheerio(this)
            .find('img.book-cover')
            .attr('data-src');
          novelUrl = baseUrl + novelUrl;

          const novel = { sourceId, novelUrl, novelName, novelCover };

          novels.push(novel);
        }
      });
    };

    const novelResults = pageCheerio('.book-ol a.book-layout');
    if (novelResults.length === 0) {
      showToast('Bypass check by searching in Webview');
    } else {
      loadSearchResults();
    }

    if (redirect.length) {
      novels.length = 0;
      const novelName = pageCheerio('#bookDetailWrapper .book-title').text();

      const novelCover = pageCheerio('#bookDetailWrapper img.book-cover').attr(
        'src',
      );
      const novelUrl =
        baseUrl +
        pageCheerio('#btnReadBook').attr('href').slice(0, -8) +
        '.html';
      const novel = { sourceId, novelUrl, novelName, novelCover };
      novels.push(novel);
    }
  };

  const loadPage = async url => {
    const body = await fetchHtml({ url, sourceId });
    const pageCheerio = cheerio.load(body);
    const redirect = pageCheerio('div.book-layout');
    await addPage(pageCheerio, redirect);
    nextPage = pageCheerio('.next').attr('href');
    if (!nextPage) {
      noNextPage === true;
    } else {
      noNextPage = nextPage === '#' ? true : false;
    }
    return { pageCheerio, noNextPage };
  };

  let url = `${searchUrl}${Term}_${pageNumber}.html`;
  do {
    const page = await loadPage(url);
    deadEnd = page.noNextPage;
    if (deadEnd === false) {
      pageNumber++;
      url = `${searchUrl}${Term}_${pageNumber}.html`;
    }
  } while (deadEnd === false);

  return novels;
};

const headers = {
  Referer: 'https://w.linovelib.com',
};

const LinovelibScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  headers,
};

export default LinovelibScraper;
