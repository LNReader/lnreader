import * as cheerio from 'cheerio';
const sourceId = 50;

const sourceName = 'Novel Updates';

const baseUrl = 'https://www.novelupdates.com/';

let headers = new Headers({
  'User-Agent':
    "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
});

const popularNovels = async (page, showLatestNovels) => {
  const totalPages = 100;
  let url =
    `${baseUrl}${
      showLatestNovels ? 'latest-series/' : 'series-ranking'
    }/?rank=week&pg=` + page;

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

  novel.genre = loadedCheerio('#seriesgenre').text().trim().replace(/\s/g, ',');

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
        loadedCheerio('.page-body').html();
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

const NovelUpdatesScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelUpdatesScraper;
