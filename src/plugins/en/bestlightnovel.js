import * as cheerio from 'cheerio';
import { Status } from '../helpers/constants';

const sourceId = 95;
const sourceName = 'BestLightNovel';

const baseUrl = 'https://bestlightnovel.com/';

const popularNovels = async page => {
  const url =
    baseUrl + 'novel_list?type=topview&category=all&state=all&page=1' + page;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.update_item.list_category').each(function () {
    const novelName = loadedCheerio(this).find('h3 > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this).find('h3 > a').attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return { novels };
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
    novelName: '',
    novelCover: '',
    author: '',
    status: Status.UNKNOWN,
    genre: '',
    summary: '',
    chapters: [],
  };

  novel.novelName = loadedCheerio('.truyen_info_right  h1').text().trim();
  novel.novelCover = loadedCheerio('.info_image img').attr('src');
  novel.summary = loadedCheerio('#noidungm').text()?.trim();
  novel.author = loadedCheerio(
    '#main_body > div.cotgiua > div.truyen_info_wrapper > div.truyen_info > div.entry-header > div.truyen_if_wrap > ul > li:nth-child(2) > a',
  )
    .text()
    ?.trim();

  let status = loadedCheerio(
    '#main_body > div.cotgiua > div.truyen_info_wrapper > div.truyen_info > div.entry-header > div.truyen_if_wrap > ul > li:nth-child(4) > a',
  )
    .text()
    ?.trim();

  novel.status =
    status === 'ONGOING'
      ? Status.ONGOING
      : status === 'COMPLETED'
      ? Status.COMPLETED
      : Status.UNKNOWN;

  let novelChapters = [];

  loadedCheerio('.chapter-list div.row').each(function () {
    const chapterName = loadedCheerio(this).find('a').text().trim();
    const releaseDate = loadedCheerio(this)
      .find('span:nth-child(2)')
      .text()
      .trim();
    const chapterUrl = loadedCheerio(this).find('a').attr('href');

    novelChapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1.name_chapter').text();
  const chapterText = loadedCheerio('#vung_doc').html();

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
  const url = `${baseUrl}search_novels/${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.update_item.list_category').each(function () {
    const novelName = loadedCheerio(this).find('h3 > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this).find('h3 > a').attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return novels;
};

const BestLightNovel = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default BestLightNovel;
