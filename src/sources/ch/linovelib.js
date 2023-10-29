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
  const body = await fetchHtml({ url: chapterUrl, sourceId });
  const pageCheerio = cheerio.load(body);
  let pageText;
  // let hasNextPage, pageNumber = 1;

  /*
   * TODO: Maybe there are other ways to get the translation table
   * It is embed and encrypted inside readtool.js
   */
  const mapping_dict = {
    '“': '「',
    '’': '』',
    '': '是',
    '': '不',
    '': '他',
    '': '个',
    '': '来',
    '': '大',
    '': '子',
    '': '说',
    '': '年',
    '': '那',
    '': '她',
    '': '得',
    '': '自',
    '': '家',
    '': '而',
    '': '去',
    '': '小',
    '': '于',
    '': '么',
    '': '好',
    '': '发',
    '': '成',
    '': '事',
    '': '用',
    '': '道',
    '': '种',
    '': '乳',
    '': '茎',
    '': '肉',
    '': '胸',
    '': '淫',
    '': '射',
    '': '骚',
    '”': '」',
    '': '的',
    '': '了',
    '': '人',
    '': '有',
    '': '上',
    '': '到',
    '': '地',
    '': '中',
    '': '生',
    '': '着',
    '': '和',
    '': '出',
    '': '里',
    '': '以',
    '': '可',
    '': '过',
    '': '能',
    '': '多',
    '': '心',
    '': '之',
    '': '看',
    '': '当',
    '': '只',
    '': '把',
    '': '第',
    '': '想',
    '': '开',
    '': '阴',
    '': '欲',
    '': '交',
    '': '私',
    '': '臀',
    '': '脱',
    '': '唇',
    '‘': '『',
    '': '一',
    '': '我',
    '': '在',
    '': '这',
    '': '们',
    '': '时',
    '': '为',
    '': '你',
    '': '国',
    '': '就',
    '': '要',
    '': '也',
    '': '后',
    '': '会',
    '': '下',
    '': '天',
    '': '对',
    '': '然',
    '': '学',
    '': '都',
    '': '起',
    '': '没',
    '': '如',
    '': '还',
    '': '样',
    '': '作',
    '': '美',
    '': '液',
    '': '呻',
    '': '性',
    '': '穴',
    '': '舔',
    '': '裸',
  };

  // const addPage = async pageCheerio => {

  const formatPage = async () => {
    // Remove JS
    pageCheerio('#ccacontent .cgo').remove();

    // Load lazyloaded images
    pageCheerio('#ccacontent img.imagecontent').each(function () {
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
          .removeClass('lazyload');
      }
    });

    // Recover the original character
    pageText = pageCheerio('#ccacontent').html();
    pageText = pageText.replace(/./g, char => mapping_dict[char] || char);

    return Promise.resolve();
  };

  await formatPage();
  const chapterName =
    pageCheerio('#atitle + h3').text() + ' — ' + pageCheerio('#atitle').text();
  const chapterText = pageText;
  // };

  // const loadPage = async url => {
  //   const body = await fetchHtml({ url, sourceId });
  //   const pageCheerio = cheerio.load(body);
  //   addPage(pageCheerio);
  //   pageHasNextPage =
  //     pageCheerio('#footlink > a[onclick$=ReadParams.url_next;]').text() ===
  //     '下一页'
  //       ? true
  //       : false;
  //   return { pageCheerio, pageHasNextPage };
  // };

  // let url = chapterUrl;
  // do {
  //   const page = await loadPage(url);
  //   hasNextPage = page.pageHasNextPage;
  //   if (hasNextPage === true) {
  //     pageNumber++;
  //     url = chapterUrl.replace(/\.html/gi, `_${pageNumber}` + '.html');
  //   }
  // } while (hasNextPage === true);

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
