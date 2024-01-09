import { showToast } from '@hooks/showToast';
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

  if (genres.length) {
    novel.genre = genres.join(', ');
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
  let chapterName, chapterText, hasNextPage, pageHasNextPage, pageText, urlNext;
  let pageNumber = 1;
  const delay = ms => new Promise(res => setTimeout(res, ms));

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
    '\ue836': '\u4e00',
    '\ue852': '\u662f',
    '\ue850': '\u4e86',
    '\ue832': '\u6211',
    '\ue812': '\u4e0d',
    '\ue833': '\u4eba',
    '\ue849': '\u5728',
    '\ue821': '\u4ed6',
    '\ue810': '\u6709',
    '\ue84c': '\u8fd9',
    '\ue815': '\u4e2a',
    '\ue842': '\u4e0a',
    '\ue82e': '\u4eec',
    '\ue817': '\u6765',
    '\ue835': '\u5230',
    '\ue837': '\u65f6',
    '\ue82d': '\u5927',
    '\ue859': '\u5730',
    '\ue85c': '\u4e3a',
    '\ue82f': '\u5b50',
    '\ue84d': '\u4e2d',
    '\ue854': '\u4f60',
    '\ue81e': '\u8bf4',
    '\ue853': '\u751f',
    '\ue80f': '\u56fd',
    '\ue80e': '\u5e74',
    '\ue813': '\u7740',
    '\ue802': '\u5c31',
    '\ue81a': '\u90a3',
    '\ue83b': '\u548c',
    '\ue851': '\u8981',
    '\ue82a': '\u5979',
    '\ue838': '\u51fa',
    '\ue808': '\u4e5f',
    '\ue83a': '\u5f97',
    '\ue814': '\u91cc',
    '\ue857': '\u540e',
    '\ue855': '\u81ea',
    '\ue800': '\u4ee5',
    '\ue81b': '\u4f1a',
    '\ue85f': '\u5bb6',
    '\ue816': '\u53ef',
    '\ue83e': '\u4e0b',
    '\ue84f': '\u800c',
    '\ue80b': '\u8fc7',
    '\ue828': '\u5929',
    '\ue843': '\u53bb',
    '\ue806': '\u80fd',
    '\ue81f': '\u5bf9',
    '\ue834': '\u5c0f',
    '\ue81c': '\u591a',
    '\ue848': '\u7136',
    '\ue830': '\u4e8e',
    '\ue84b': '\u5fc3',
    '\ue84a': '\u5b66',
    '\ue85d': '\u4e48',
    '\ue861': '\u4e4b',
    '\ue809': '\u90fd',
    '\ue80c': '\u597d',
    '\ue84e': '\u770b',
    '\ue858': '\u8d77',
    '\ue840': '\u53d1',
    '\ue85b': '\u5f53',
    '\ue863': '\u6ca1',
    '\ue839': '\u6210',
    '\ue827': '\u53ea',
    '\ue841': '\u5982',
    '\ue805': '\u4e8b',
    '\ue845': '\u628a',
    '\ue820': '\u8fd8',
    '\ue83c': '\u7528',
    '\ue847': '\u7b2c',
    '\ue819': '\u6837',
    '\ue82b': '\u9053',
    '\ue80a': '\u60f3',
    '\ue822': '\u4f5c',
    '\ue85e': '\u79cd',
    '\ue801': '\u5f00',
    '\ue856': '\u7f8e',
    '\ue811': '\u4e73',
    '\ue860': '\u9634',
    '\ue80d': '\u6db2',
    '\ue83f': '\u830e',
    '\ue803': '\u6b32',
    '\ue804': '\u547b',
    '\ue825': '\u8089',
    '\ue846': '\u4ea4',
    '\ue85a': '\u6027',
    '\ue831': '\u80f8',
    '\ue81d': '\u79c1',
    '\ue826': '\u7a74',
    '\ue818': '\u6deb',
    '\ue823': '\u81c0',
    '\ue829': '\u8214',
    '\ue807': '\u5c04',
    '\ue862': '\u8131',
    '\ue83d': '\u88f8',
    '\ue824': '\u9a9a',
    '\ue844': '\u5507',
  };

  const addPage = async pageCheerio => {
    const formatPage = async () => {
      // Remove JS
      let style = pageCheerio('style:first').prop('innerHTML');
      style = style.replace(/(.*?)\{.*?\}/g, '$1,').split(',');
      style.push(style.pop().replace(/\}/, '.cgo'));
      style.map(tag => pageCheerio(tag).remove());

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
      pageCheerio('.atitle h3').text() + ' — ' + pageCheerio('#atitle').text();
    if (chapterText === undefined) {
      chapterText = '<h2>' + chapterName + '</h2>';
    }
    chapterText +=
      pageText ||
      'Chapter not found, Report at lnreader github/discord if you see this message';
  };

  const loadPage = async url => {
    const body = await fetchHtml({ url, sourceId });
    const pageCheerio = cheerio.load(body);
    await addPage(pageCheerio);
    urlNext = pageCheerio('#aread script:first')
      .prop('innerHTML')
      .replace(/.*next:'(.*?)'.*/g, '$1');
    pageHasNextPage = urlNext.match(/_/) ? true : false;
    return { pageCheerio, pageHasNextPage };
  };

  let url = chapterUrl;
  do {
    const page = await loadPage(url);
    await delay(1000);
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
