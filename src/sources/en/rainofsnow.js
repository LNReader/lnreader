import cheerio from 'react-native-cheerio';
import {Status} from '../helpers/constants';

const sourceId = 78;

const sourceName = 'RainOfSnow';

const baseUrl = 'https://rainofsnow.com/';

const popularNovels = async page => {
  let url = baseUrl + 'novels/page/' + page;

  const totalPages = 5;

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novels = [];

  $('.minbox').each(function () {
    const novelName = $(this).find('h3').text();
    const novelCover = $(this).find('img').attr('data-src');
    const novelUrl = $(this).find('h3 > a').attr('href');

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return {novels, totalPages};
};

const parseNovelAndChapters = async novelUrl => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novel = {sourceId, sourceName, url, novelUrl};

  novel.novelName = $('h2').text().trim();

  novel.novelCover = $('.imagboca1 > img').attr('data-src');

  novel.summary = $('#synop').text().trim();

  novel.genre = $(
    'body > div.queen > div > div > div.row > div.col-md-12.col-lg-7 > div > div.backcolor1 > ul > li:nth-child(5) > small',
  )
    .text()
    .trim();

  novel.author = $(
    'body > div.queen > div > div > div.row > div.col-md-12.col-lg-7 > div > div.backcolor1 > ul > li:nth-child(2) > small',
  ).text();

  novel.status = Status.UNKNOWN;

  let novelChapters = [];

  $('#chapter')
    .find('li')
    .each(function () {
      const chapterName = $(this).find('.chapter').first().text().trim();
      const releaseDate = $(this).find('small').text();
      const chapterUrl = $(this).find('a').attr('href');

      novelChapters.push({chapterName, releaseDate, chapterUrl});
    });

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(chapterUrl);
  const body = await result.text();

  $ = cheerio.load(body);

  let chapterName = $('.content > h2').text();
  let chapterText = $('.content').html();

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
  let url = baseUrl + '?s=' + searchTerm;

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novels = [];

  $('.minbox').each(function () {
    const novelName = $(this).find('h3').text();
    const novelCover = $(this).find('img').attr('data-src');
    const novelUrl = $(this).find('h3 > a').attr('href');

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

const RainOfSnowScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default RainOfSnowScraper;
