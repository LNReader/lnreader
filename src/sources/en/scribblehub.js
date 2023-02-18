import * as cheerio from 'cheerio';
import { fetchHtml } from '@utils/fetch/fetch';
const baseUrl = 'https://www.scribblehub.com/';

const popularNovels = async page => {
  const totalPages = 326;
  let url = baseUrl + 'series-ranking/?sort=1&order=4&pg=' + page;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.search_main_box').each(function () {
    const novelName = loadedCheerio(this).find('div.search_title > a').text();
    const novelCover = loadedCheerio(this)
      .find('div.search_img > img')
      .attr('src');

    let novelUrl = loadedCheerio(this)
      .find('div.search_title > a')
      .attr('href');
    novelUrl = novelUrl.split('/');
    novelUrl = novelUrl[4] + '-' + novelUrl[5];

    const novel = {
      sourceId: 35,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = baseUrl + 'read/' + novelUrl;

  const body = await fetchHtml({ url, sourceId });

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 35;

  novel.sourceName = 'Scribble Hub';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('div.fic_title').text();

  novel.novelCover = loadedCheerio('div.fic_image > img').attr('src');

  novel.summary = loadedCheerio('div.wi_fic_desc').text();

  novel.genre = '';
  loadedCheerio('span.wi_fic_genre')
    .find('span')
    .each(function (res) {
      novel.genre += loadedCheerio(this).text() + ',';
    });
  if (novel.genre) {
    novel.genre = novel.genre.slice(0, -1);
  }

  novel.status = loadedCheerio('span.rnd_stats')
    .next()
    .text()
    .includes('Ongoing')
    ? 'Ongoing'
    : 'Completed';

  novel.author = loadedCheerio('span.auth_name_fic').text();

  let formData = new FormData();
  formData.append('action', 'wi_getreleases_pagination');
  formData.append('pagenum', '-1');
  formData.append('mypostid', novelUrl.split('-')[0]);

  const data = await fetch(
    'https://www.scribblehub.com/wp-admin/admin-ajax.php',
    {
      method: 'POST',
      body: formData,
    },
  );
  const text = await data.text();

  loadedCheerio = cheerio.load(text);

  let novelChapters = [];

  loadedCheerio('.toc_w').each(function () {
    const chapterName = loadedCheerio(this).find('.toc_a').text();
    const releaseDate = loadedCheerio(this).find('.fic_date_pub').text();

    const chapterUrl = loadedCheerio(this).find('a').attr('href').split('/')[6];
    // .replace("/novel/" + novelUrl + "/", "");

    novelChapters.push({
      chapterName,
      releaseDate,
      chapterUrl,
    });
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}read/${novelUrl}/chapter/${chapterUrl}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('div.chapter-title').text();

  let chapterText = loadedCheerio('div.chp_raw').html();
  const chapter = {
    sourceId: 35,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url =
    'https://www.scribblehub.com/?s=' + searchTerm + '&post_type=fictionposts';

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.search_main_box').each(function () {
    const novelName = loadedCheerio(this).find('div.search_title > a').text();
    const novelCover = loadedCheerio(this)
      .find('div.search_img > img')
      .attr('src');

    let novelUrl = loadedCheerio(this)
      .find('div.search_title > a')
      .attr('href');
    novelUrl = novelUrl.split('/');
    novelUrl = novelUrl[4] + '-' + novelUrl[5];

    const novel = {
      sourceId: 35,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });
  return novels;
};

const ScribbleHubScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default ScribbleHubScraper;
