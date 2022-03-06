import cheerio from 'react-native-cheerio';
import { Status } from '../helpers/constants';

const baseUrl = 'https://reaperscans.com.br/';

const sourceId = 79;
const sourceName = 'ReaperScans (Br)';

const popularNovels = async page => {
  let url =
    baseUrl + '/all-series/todas-as-series/page/' + page + '/?m_orderby=rating';

  const totalPages = 1;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.page-item-detail').each(function () {
    const novelName = loadedCheerio(this)
      .find('.item-summary h3')
      .text()
      .trim();
    const novelCover = loadedCheerio(this)
      .find('.img-responsive')
      .attr('data-src');

    let novelUrl = loadedCheerio(this).find('div > a').attr('href');

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
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = { sourceId, url, sourceName };

  loadedCheerio('.post-title > h3 > span').remove();

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('.post-title > h1').text().trim();

  novel.novelCover = loadedCheerio('.summary_image > a > img').attr('data-src');

  loadedCheerio('.post-content_item').each(function () {
    const detailName = loadedCheerio(this)
      .find('.summary-heading > h5')
      .text()
      .trim();
    const detail = loadedCheerio(this).find('.summary-content').text().trim();

    switch (detailName) {
      case 'Genre(s)':
        novel.genre = detail.replace(/[\t\n]/g, ',');
        break;
      case 'Author(s)':
        novel.author = detail;
        break;
      case 'Status':
        novel.status = detail.includes('OnGoing')
          ? Status.ONGOING
          : Status.COMPLETED;
        break;
    }
  });

  loadedCheerio('.description-summary > div.summary__content')
    .find('em')
    .remove();
  loadedCheerio('.premium-block').remove();

  novel.summary = loadedCheerio('div.summary__content').text().trim();

  let novelChapters = [];

  loadedCheerio('.wp-manga-chapter').each(function () {
    loadedCheerio('i').remove();

    const chapterName = loadedCheerio(this).find('a').text().trim();
    const releaseDate = null;

    const chapterUrl = loadedCheerio(this).find('a').attr('href');

    const chapter = { chapterName, releaseDate, chapterUrl };

    novelChapters.push(chapter);
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('#chapter-heading').text();
  let chapterText = loadedCheerio('.reading-content').html();
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
    const novelName = loadedCheerio(this)
      .find('.post-title > h3')
      .text()
      .trim();
    const novelCover = loadedCheerio(this)
      .find('div > div > a > img')
      .attr('data-src');

    let novelUrl = loadedCheerio(this).find('div > div > a').attr('href');
    novelUrl = novelUrl.replace(`${baseUrl}/`, '');

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

const ReaperScansBrScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default ReaperScansBrScraper;
