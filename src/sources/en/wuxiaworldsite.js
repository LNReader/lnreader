import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';
const baseUrl = 'https://wuxiaworldsite.co/';
const searchUrl = 'https://wuxiaworldsite.co/search/';

const popularNovels = async page => {
  let totalPages = 222;
  const url = 'https://wuxiaworldsite.co/ajax-story-power.ajax';

  const formData = new FormData();
  formData.append('page', page);
  formData.append('keyword', '');
  formData.append('count', 18);
  formData.append('genres_include', '');
  formData.append('limit', 18);
  formData.append('order_type', 'DESC');
  formData.append('order_by', 'views');

  const body = await fetchHtml({
    url,
    sourceId,
    init: { method: 'POST', body: formData },
  });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.a_item').each((i, el) => {
    const novelName = loadedCheerio(el).find('a').attr('title');
    const novelCover = baseUrl + loadedCheerio(el).find('a > img').attr('src');

    let novelUrl = loadedCheerio(el).find('.name_views > a').attr('href');
    const novelId = novelUrl.split('/');
    novelUrl = novelId[2] + '/';

    const novel = {
      sourceId: 12,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}${novelUrl}`;

  const body = await fetchHtml({ url, sourceId });

  let loadedCheerio = cheerio.load(body);

  loadedCheerio('.category_list').remove();

  let novel = {};

  novel.sourceId = 12;

  novel.sourceName = 'WuxiaWorldSite';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('.content-reading > h1').text().trim();

  novel.novelCover = baseUrl + loadedCheerio('.img-read> img').attr('src');

  novel.summary = loadedCheerio('.story-introduction-content').text();

  novel.author = loadedCheerio('.content-reading > p').text().trim();

  novel.artist = null;

  novel.genre = '';

  loadedCheerio('.a_tag_item').each((i, el) => {
    novel.genre += loadedCheerio(el).text() + ',';
  });

  novel.genre = novel.genre.split(',');
  novel.genre.pop();

  novel.status = novel.genre.pop();

  novel.genre = novel.genre.join(',');

  const novelID = loadedCheerio('.show-more-list').attr('data-id');

  const getChapters = async id => {
    const chapterListUrl = baseUrl + '/get-full-list.ajax?id=' + id;

    const data = await fetch(chapterListUrl);
    const chapters = await data.text();

    loadedCheerio = cheerio.load(chapters);

    let novelChapters = [];

    loadedCheerio('.new-update-content').each((i, el) => {
      let chapterName = loadedCheerio(el).text().split(/\t+/);
      const releaseDate = chapterName.pop();
      chapterName = chapterName[0];
      let chapterUrl = loadedCheerio(el).attr('href');
      chapterUrl = chapterUrl.split('/').pop();

      const chapter = {
        chapterName,
        releaseDate,
        chapterUrl,
      };
      novelChapters.push(chapter);
    });
    return novelChapters;
  };

  novel.chapters = await getChapters(novelID);

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}/${novelUrl}/${chapterUrl}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('h1.text-center.heading_read').text();
  let chapterText = loadedCheerio('.content-story').html();

  novelUrl += '/';
  chapterUrl += '/';

  const chapter = {
    sourceId: 12,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `${searchUrl}${searchTerm}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.a_item').each((i, el) => {
    const novelName = loadedCheerio(el).find('.name_views > a').attr('title');
    const novelCover = baseUrl + loadedCheerio(el).find('a > img').attr('src');
    let novelUrl = loadedCheerio(el).find('.name_views > a').attr('href');
    const novelId = novelUrl.split('/');
    novelUrl = novelId[2] + '/';

    const novel = {
      sourceId: 12,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return novels;
};

const WuxiaWorldSiteScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default WuxiaWorldSiteScraper;
