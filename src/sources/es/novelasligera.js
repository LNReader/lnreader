import * as cheerio from 'cheerio';

const baseUrl = 'https://novelasligera.com/';
const sourceName = 'Novelas Ligera';
const sourceId = 26;

const popularNovels = async page => {
  if (page > 1) {
    return { novels: [] };
  }

  let url = baseUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.elementor-column').each(function () {
    const novelName = loadedCheerio(this)
      .find('.widget-image-caption.wp-caption-text')
      .text();
    if (novelName) {
      const novelCover = loadedCheerio(this).find('img').attr('data-lazy-src');

      let novelUrl = loadedCheerio(this).find('a').attr('href');
      novelUrl = novelUrl.replace(baseUrl, '');
      novelUrl = novelUrl.replace('novela/', '');

      const novel = {
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    }
  });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = baseUrl + 'novela/' + novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
  };

  novel.novelName = loadedCheerio('h1').text();
  novel.novelCover = loadedCheerio('.elementor-widget-container')
    .find('img')
    .attr('data-lazy-src');

  loadedCheerio('.elementor-widget-container')
    .find('p')
    .each(function () {
      if (loadedCheerio(this).text().includes('Autor:')) {
        novel.author = loadedCheerio(this).text().replace('Autor:', '').trim();
      }
      if (loadedCheerio(this).text().includes('Estado:')) {
        novel.status = loadedCheerio(this)
          .text()
          .replace('Estado: ', '')
          .trim();
      }

      if (loadedCheerio(this).text().includes('Género:')) {
        loadedCheerio(this).find('span').remove();
        novel.genre = loadedCheerio(this).text().replace(/,\s/g, ',');
      }
    });

  const summary = loadedCheerio(
    'div[data-widget_type="text-editor.default"] .elementor-widget-container',
  ).first();
  summary.find('div.yasr-visitor-votes').remove();
  novel.summary = summary
    .children()
    .toArray()
    .filter(e => e.childNodes[0]?.type === 'text')
    .map(e => e.childNodes[0].data)
    .join('\n\n');

  let novelChapters = [];

  loadedCheerio('.elementor-accordion-item').remove();

  loadedCheerio('.elementor-tab-content')
    .find('li')
    .each(function () {
      const chapterName = loadedCheerio(this).text();
      const releaseDate = null;
      const chapterUrl = loadedCheerio(this)
        .find('a')
        .attr('href')
        .replace(baseUrl + 'novela/', '');

      const chapter = { chapterName, releaseDate, chapterUrl };

      novelChapters.push(chapter);
    });

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = baseUrl + 'novela/' + chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('h1.entry-title').text();

  loadedCheerio('.osny-nightmode.osny-nightmode--left').remove();
  loadedCheerio('.code-block.code-block-1').remove();
  loadedCheerio('.adsb30').remove();
  loadedCheerio('.saboxplugin-wrap').remove();
  loadedCheerio('.wp-post-navigation').remove();

  let chapterText = loadedCheerio('.entry-content').html();

  const chapter = {
    sourceId: 26,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = baseUrl + '?s=' + searchTerm + '&post_type=wp-manga';

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.inside-article').each(function () {
    const novelCover = loadedCheerio(this).find('img').attr('data-lazy-src');
    let novelUrl = loadedCheerio(this).find('a').attr('href').split('/')[4];

    let novelName;

    if (novelUrl) {
      novelName = novelUrl.replace(/-/g, ' ').replace(/^./, function (x) {
        return x.toUpperCase();
      });
    }

    novelUrl += '/';

    const novel = {
      sourceId: 26,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return novels;
};

const NovelasLigeraScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelasLigeraScraper;
