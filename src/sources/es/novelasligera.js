import cheerio from 'react-native-cheerio';
import { htmlToText } from '../helpers/htmlToText';

const baseUrl = 'https://novelasligera.com/';

const popularNovels = async page => {
  let totalPages = 1;
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
      const novelCover = loadedCheerio(this).find('img').attr('src');

      let novelUrl = loadedCheerio(this).find('a').attr('href');
      novelUrl = novelUrl.replace(baseUrl, '');
      novelUrl = novelUrl.replace('novela/', '');

      const novel = {
        sourceId: 26,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    }
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = baseUrl + 'novela/' + novelUrl;

  // console.log(url);

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 26;

  novel.sourceName = 'Novelas Ligera';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('h1').text();

  novel.novelCover = loadedCheerio('.elementor-widget-container')
    .find('img')
    .attr('src');

  loadedCheerio('.elementor-row')
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

  novel.artist = null;

  novel.novelSummary = loadedCheerio(
    '.elementor-text-editor.elementor-clearfix',
  ).text();

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
  // console.log(url);

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
  chapterText = htmlToText(chapterText, { preserveNewlines: true });

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
  // console.log(url);

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.inside-article').each(function () {
    const novelCover = loadedCheerio(this).find('img').attr('src');
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

  novels = [{ ...novels[1] }];

  return novels;
};

const NovelasLigeraScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelasLigeraScraper;
