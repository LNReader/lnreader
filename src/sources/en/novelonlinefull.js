import cheerio from 'react-native-cheerio';
import {Status} from '../helpers/constants';

const sourceId = 71;
const sourceName = 'NovelOnlineFull.com';
const baseUrl = 'https://novelonlinefull.com/';

const popularNovels = async page => {
  let url =
    baseUrl + 'novel_list?type=topview&category=all&state=all&page=' + page;
  const totalPages = 2155;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.update_item.list_category').each(function () {
    const novelName = loadedCheerio(this).find('h3').text().trim();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    let novelUrl = loadedCheerio(this).find('h3 > a').attr('href');
    novelUrl = novelUrl.replace(baseUrl + 'novel/', '');

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
  const url = baseUrl + 'novel/' + novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel = {sourceId, sourceName, url, novelUrl};

  novel.novelName = loadedCheerio('h1').text().trim();

  novel.novelCover = loadedCheerio('.info_image > img').attr('src');

  novel.summary = loadedCheerio('#noidungm').text().trim();

  novel.genre = loadedCheerio('div.truyen_if_wrap > ul > li:nth-child(3)')
    .text()
    .replace('GENRES: ', '')
    .replace(/ - /g, ',')
    .trim();

  // console.log(novel.genre);

  novel.status =
    loadedCheerio(' div.truyen_if_wrap > ul > li:nth-child(4) > a')
      .text()
      .replace('STATUS', '')
      .trim() === 'ONGOING'
      ? Status.ONGOING
      : Status.COMPLETED;

  novel.author = loadedCheerio('div.truyen_if_wrap > ul > li:nth-child(2)')
    .text()
    .replace('Author(s):', '')
    .trim();

  let novelChapters = [];

  loadedCheerio('.chapter-list')
    .find('.row')
    .each(function () {
      const releaseDate = loadedCheerio(this).find('span:nth-child(2)').text();

      const chapterName = loadedCheerio(this)
        .find('span:nth-child(1) > a')
        .text();
      const chapterUrl = loadedCheerio(this).find('a').attr('href');

      novelChapters.push({
        chapterName,
        chapterUrl,
        releaseDate,
      });
    });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('.name_chapter').text();
  let chapterText = loadedCheerio('#vung_doc').html();

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
  const url = baseUrl + 'search_novels/' + searchTerm;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.update_item.list_category').each(function () {
    const novelName = loadedCheerio(this).find('h3').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    let novelUrl = loadedCheerio(this).find('h3 > a').attr('href');
    novelUrl = novelUrl.replace(baseUrl + 'novel/', '');

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

const NovelOnlineFullScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelOnlineFullScraper;
