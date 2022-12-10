import * as cheerio from 'cheerio';
import { defaultTo } from 'lodash';
import { FilterInputs } from '../types/filterTypes';
const sourceId = 50;

const sourceName = 'Novel Updates';

const baseUrl = 'https://www.novelupdates.com/';

let headers = new Headers({
  'User-Agent':
    "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
});

const getPopularNovelsUrl = (page, { showLatestNovels, filters }) => {
  let url = `${baseUrl}${
    filters
      ? 'series-finder'
      : showLatestNovels
      ? 'latest-series'
      : 'series-ranking'
  }/`;

  if (!filters) {
    url += '?rank=week';
  } else {
    url += '?sf=1';
  }

  if (filters?.novelType?.length) {
    url += '&nt=' + filters?.novelType.join(',');
  }

  if (filters?.genres?.length) {
    url += '&gi=' + filters?.genres.join(',') + '&mgi=and';
  }

  if (filters?.language?.length) {
    url += '&org=' + filters?.language.join(',');
  }

  if (filters?.storyStatus) {
    url += '&ss=' + filters?.storyStatus;
  }

  url += '&sort=' + defaultTo(filters?.sort, 'sdate');

  url += '&order=' + defaultTo(filters?.order, 'desc');

  url += '&pg=' + page;

  return url;
};

const popularNovels = async (page, { showLatestNovels, filters }) => {
  const totalPages = 100;
  const url = getPopularNovelsUrl(page, { showLatestNovels, filters });

  const result = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels = [];

  loadedCheerio('div.search_main_box_nu').each(function (res) {
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelName = loadedCheerio(this).find('.search_title > a').text();
    const novelUrl = loadedCheerio(this)
      .find('.search_title > a')
      .attr('href')
      .split('/')[4];

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
  const url = `${baseUrl}series/${novelUrl}`;

  const result = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
  };

  novel.novelName = loadedCheerio('.seriestitlenu').text();

  novel.novelCover = loadedCheerio('.seriesimg > img').attr('src');

  novel.author = loadedCheerio('#showauthors').text().trim();
  novel.genre = loadedCheerio('#seriesgenre')
    .children('a')
    .map((i, el) => loadedCheerio(el).text())
    .toArray()
    .join(',');
  novel.status = loadedCheerio('#editstatus').text().includes('Ongoing')
    ? 'Ongoing'
    : 'Completed';

  let type = loadedCheerio('#showtype').text().trim();

  let summary = loadedCheerio('#editdescription').text().trim();

  novel.summary = summary + `\n\nType: ${type}`;

  let novelChapters = [];

  const novelId = loadedCheerio('input#mypostid').attr('value');

  let formData = new FormData();
  formData.append('action', 'nd_getchapters');
  formData.append('mygrr', 0);
  formData.append('mypostid', parseInt(novelId, 10));

  const data = await fetch(
    'https://www.novelupdates.com/wp-admin/admin-ajax.php',
    {
      method: 'POST',
      headers,
      body: formData,
    },
  );
  const text = await data.text();

  loadedCheerio = cheerio.load(text);

  loadedCheerio('li.sp_li_chp').each(function () {
    const chapterName = loadedCheerio(this).text().trim();

    const releaseDate = null;

    const chapterUrl =
      'https:' + loadedCheerio(this).find('a').first().next().attr('href');

    novelChapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

function getLocation(href) {
  var match = href.match(
    /^(https?:)\/\/(([^:/?#]*)(?::([0-9]+))?)([/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/,
  );
  return match && `${match[1]}//${match[3]}`;
}

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  // console.log("Original URL: ", url);

  let result, body;

  let chapterName = '';

  let chapterText = '';

  try {
    result = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    body = await result.text();

    // console.log(result.url);

    // console.log("Redirected URL: ", result.url);

    const loadedCheerio = cheerio.load(body);

    let isWuxiaWorld = result.url.toLowerCase().includes('wuxiaworld');

    let isBlogspot = result.url.toLowerCase().includes('blogspot');

    let isTumblr = result.url.toLowerCase().includes('tumblr');

    let isWattpad = result.url.toLowerCase().includes('wattpad');

    let isTravisTranslation = result.url
      .toLowerCase()
      .includes('travistranslations');

    /**
     * Checks if its a wwordpress site
     */
    let isWordPress =
      loadedCheerio('meta[name="generator"]').attr('content') ||
      loadedCheerio('footer').text();

    if (isWordPress) {
      isWordPress =
        isWordPress.toLowerCase().includes('wordpress') ||
        isWordPress.includes('Site Kit by Google') ||
        loadedCheerio('.powered-by').text().toLowerCase().includes('wordpress');
    }

    let isRainOfSnow = result.url.toLowerCase().includes('rainofsnow');

    let isWebNovel = result.url.toLowerCase().includes('webnovel');

    let isHostedNovel = result.url.toLowerCase().includes('hostednovel');

    let isScribbleHub = result.url.toLowerCase().includes('scribblehub');

    if (isWuxiaWorld) {
      chapterText = loadedCheerio('#chapter-content').html();
    } else if (isRainOfSnow) {
      chapterText = loadedCheerio('div.content').html();
    } else if (isTumblr) {
      chapterText = loadedCheerio('.post').html();
    } else if (isBlogspot) {
      loadedCheerio('.post-share-buttons').remove();

      chapterText = loadedCheerio('.entry-content').html();
    } else if (isHostedNovel) {
      chapterText = loadedCheerio('.chapter').html();
    } else if (isScribbleHub) {
      chapterText = loadedCheerio('div.chp_raw').html();
    } else if (isWattpad) {
      chapterText = loadedCheerio('.container  pre').html();
    } else if (isTravisTranslation) {
      chapterText = loadedCheerio('.reader-content').html();
    } else if (isWordPress) {
      /**
       * Remove wordpress bloat tags
       */

      const bloatClasses = [
        '.c-ads',
        '#madara-comments',
        '#comments',
        '.content-comments',
        '.sharedaddy',
        '.wp-dark-mode-switcher',
        '.wp-next-post-navi',
        '.wp-block-buttons',
        '.wp-block-columns',
        '.post-cats',
        '.sidebar',
        '.author-avatar',
        '.ezoic-ad',
      ];

      bloatClasses.map(tag => loadedCheerio(tag).remove());

      chapterText =
        loadedCheerio('.entry-content').html() ||
        loadedCheerio('.single_post').html() ||
        loadedCheerio('.post-entry').html() ||
        loadedCheerio('.main-content').html() ||
        loadedCheerio('article.post').html() ||
        loadedCheerio('.content').html() ||
        loadedCheerio('#content').html() ||
        loadedCheerio('.page-body').html() ||
        loadedCheerio('.td-page-content').html();
    } else if (isWebNovel) {
      chapterText = loadedCheerio('.cha-words').html();

      if (!chapterText) {
        chapterText = loadedCheerio('._content').html();
      }
    } else {
      /**
       * Remove unnecessary tags
       */
      const tags = ['nav', 'header', 'footer', '.hidden'];

      tags.map(tag => loadedCheerio(tag).remove());

      chapterText = loadedCheerio('body').html();
    }

    if (!chapterText) {
      chapterText =
        "Chapter not available.\n\nReport if it's available in webview.";
    } else {
      /**
       * Convert relative urls to absolute
       */
      chapterText = chapterText.replace(
        /href="\//g,
        `href="${getLocation(result.url)}/`,
      );
    }
  } catch (error) {
    chapterText = `Chapter not available (Error: ${error.message}).\n\nReport if it's available in webview.`;
  }

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
  const url =
    'https://www.novelupdates.com/?s=' + searchTerm + '&post_type=seriesplans';

  const res = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await res.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.search_main_box_nu').each(function () {
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelName = loadedCheerio(this).find('.search_title > a').text();
    const novelUrl = loadedCheerio(this)
      .find('.search_title > a')
      .attr('href')
      .split('/')[4];

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

const filters = [
  {
    key: 'sort',
    label: 'Sort Results By',
    values: [
      { label: 'Last Updated', value: 'sdate' },
      { label: 'Rating', value: 'srate' },
      { label: 'Rank', value: 'srank' },
      { label: 'Reviews', value: 'sreview' },
      { label: 'Chapters', value: 'srel' },
      { label: 'Title', value: 'abc' },
      { label: 'Readers', value: 'sread' },
      { label: 'Frequency', value: 'sfrel' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'order',
    label: 'Order',
    values: [
      { label: 'Descending', value: 'desc' },
      { label: 'Ascending', value: 'asc' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'storyStatus',
    label: 'Story Status (Translation)',
    values: [
      { label: 'All', value: '' },
      { label: 'Completed', value: '2' },
      { label: 'Ongoing', value: '3' },
      { label: 'Hiatus', value: '4' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'language',
    label: 'Language',
    values: [
      { label: 'Chinese', value: 495 },
      { label: 'Filipino', value: 9181 },
      { label: 'Indonesian', value: 9179 },
      { label: 'Japanese', value: 496 },
      { label: 'Khmer', value: 18657 },
      { label: 'Korean', value: 497 },
      { label: 'Malaysian', value: 9183 },
      { label: 'Thai', value: 9954 },
      { label: 'Vietnamese', value: 9177 },
    ],
    inputType: FilterInputs.Checkbox,
  },
  {
    key: 'novelType',
    label: 'Novel Type',
    values: [
      { label: 'Light Novel', value: '2443' },
      { label: 'Published Novel', value: '26874' },
      { label: 'Web Novel', value: '2444' },
    ],
    inputType: FilterInputs.Checkbox,
  },
  {
    key: 'genres',
    label: 'Genres',
    values: [
      { label: 'Action', value: 8 },
      { label: 'Adult', value: 280 },
      { label: 'Adventure', value: 13 },
      { label: 'Comedy', value: 17 },
      { label: 'Drama', value: 9 },
      { label: 'Ecchi', value: 292 },
      { label: 'Fantasy', value: 5 },
      { label: 'Gender Bender', value: 168 },
      { label: 'Harem', value: 3 },
      { label: 'Historical', value: 330 },
      { label: 'Horror', value: 343 },
      { label: 'Josei', value: 324 },
      { label: 'Martial Arts', value: 14 },
      { label: 'Mature', value: 4 },
      { label: 'Mecha', value: 10 },
      { label: 'Mystery', value: 245 },
      { label: 'Psychoical', value: 486 },
      { label: 'Romance', value: 15 },
      { label: 'School Life', value: 6 },
      { label: 'Sci-fi', value: 11 },
      { label: 'Seinen', value: 18 },
      { label: 'Shoujo', value: 157 },
      { label: 'Shoujo Ai', value: 851 },
      { label: 'Shounen', value: 12 },
      { label: 'Shounen Ai', value: 1692 },
      { label: 'Slice of Life', value: 7 },
      { label: 'Smut', value: 281 },
      { label: 'Sports', value: 1357 },
      { label: 'Supernatural', value: 16 },
      { label: 'Tragedy', value: 132 },
      { label: 'Wuxia', value: 479 },
      { label: 'Xianxia', value: 480 },
      { label: 'Xuanhuan', value: 3954 },
      { label: 'Yaoi', value: 560 },
      { label: 'Yuri', value: 922 },
    ],
    inputType: FilterInputs.Checkbox,
  },
];

const NovelUpdatesScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default NovelUpdatesScraper;
