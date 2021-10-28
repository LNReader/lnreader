import cheerio from 'react-native-cheerio';
import {defaultCoverUri} from '../helpers/constants';

const sourceId = 59;
const sourceName = 'ArNovel';

const baseUrl = 'https://arnovel.me/';

const popularNovels = async page => {
  const totalPages = 25;
  const url = baseUrl + 'novels/page/' + page;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.page-item-detail').each(function () {
    const novelName = loadedCheerio(this).find('.h5 > a').text();
    const novelCover = defaultCoverUri;
    const novelUrl = loadedCheerio(this).find('.h5 > a').attr('href');

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  console.log(url);

  return {totalPages, novels};
};

const parseNovelAndChapters = async novelUrl => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
    novelCover: defaultCoverUri,
    author: '',
    status: '',
    genre: '',
    summary: '',
    chapters: [],
  };

  novel.novelName = loadedCheerio('.post-title > h1').text().trim();

  loadedCheerio('.post-content_item').each(function () {
    const key = loadedCheerio(this).find('h5').text().trim();
    const value = loadedCheerio(this).find('.summary-content').text().trim();

    switch (key) {
      case 'التصنيفات':
        novel.genre = value.replace(/[\t\n]/g, ',');
        break;
      case 'المؤلف (ين)':
        novel.author = value;
        break;
      case 'الحالة':
        novel.status = value;
        break;
    }
  });

  novel.summary = loadedCheerio('div.summary__content').text().trim();

  let novelChapters = [];

  const data = await fetch(`${url}ajax/chapters/`, {method: 'POST'});
  const chapterListRaw = await data.text();

  loadedCheerio = cheerio.load(chapterListRaw);

  loadedCheerio('.wp-manga-chapter').each(function () {
    const chapterName = loadedCheerio(this).find('a').text().trim();
    const releaseDate = null;
    const chapterUrl = loadedCheerio(this).find('a').attr('href');

    novelChapters.push({chapterName, releaseDate, chapterUrl});
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1#chapter-heading').text();
  const chapterText = loadedCheerio('.reading-content').html();

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
  const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.c-tabs-item__content').each(function () {
    const novelName = loadedCheerio(this).find('.h4 > a').text();
    const novelCover = defaultCoverUri;
    const novelUrl = loadedCheerio(this).find('.h4 > a').attr('href');

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

const ArNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default ArNovelScraper;
