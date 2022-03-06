import cheerio from 'react-native-cheerio';
import { Status } from '../helpers/constants';

const sourceId = 90;
const sourceName = 'NitroScans';

const baseUrl = 'https://nitroscans.com/';

const popularNovels = async page => {
  const totalPages = 2;
  const url = baseUrl + 'manga-genre/novel/page/' + page;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.page-item-detail').each(function () {
    const novelName = loadedCheerio(this).find('h3 > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');
    const novelUrl = loadedCheerio(this).find('h3 > a').attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return { totalPages, novels };
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

  loadedCheerio('.manga-title-badges.custom.novel').remove();

  novel.novelName = loadedCheerio('.post-title > h1').text().trim();
  novel.novelCover = loadedCheerio('.summary_image')
    .find('img')
    .attr('data-src');

  novel.summary = loadedCheerio('.summary__content').text()?.trim();

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
  let novelChapters = [];

  const novelId = loadedCheerio('.rating-post-id').attr('value');

  let formData = new FormData();
  formData.append('action', 'manga_get_chapters');
  formData.append('manga', novelId);

  const data = await fetch(baseUrl + 'wp-admin/admin-ajax.php', {
    method: 'POST',
    body: formData,
  });
  const text = await data.text();

  loadedCheerio = cheerio.load(text);

  loadedCheerio('.wp-manga-chapter').each(function () {
    const chapterName = loadedCheerio(this).find('a').text().trim();
    const releaseDate = loadedCheerio(this).find('span').text().trim();
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
  const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga&genre%5B%5D=novel&op=&author=&artist=&release=&adult=`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.c-tabs-item__content').each(function () {
    const novelName = loadedCheerio(this).find('h3 > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');
    const novelUrl = loadedCheerio(this).find('h3 > a').attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return novels;
};

const NitroScansScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NitroScansScraper;
