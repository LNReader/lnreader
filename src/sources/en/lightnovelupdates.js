import cheerio from 'react-native-cheerio';
import NovelUpdatesScraper from './novelupdates';

const sourceId = 72;
const sourceName = 'LightNovelUpdates';
const baseUrl = 'https://www.lightnovelupdates.com/';

const popularNovels = async page => {
  let url = `${baseUrl}novel/page/${page}/?m_orderby=rating`;
  let totalPages = 500;

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novels = [];

  $('.page-item-detail').each(function () {
    const novelName = $(this).find('.h5 > a').text();
    const novelCover = $(this).find('img').attr('src');
    const novelUrl = $(this).find('.h5 > a').attr('href');

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return {totalPages, novels};
};

const parseNovelAndChapters = async novelUrl => {
  const url = novelUrl;

  console.log(url);

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novel = {sourceId, sourceName, novelUrl, url};

  novel.novelName = $('.post-title > h1').text().trim();
  novel.novelCover =
    $('.summary_image > a > img').attr('src') ||
    'https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true';

  $('.post-content_item').each(function (result) {
    detailName = $(this).find('.summary-heading > h5').text().trim();
    detail = $(this).find('.summary-content').text().trim();

    switch (detailName) {
      case 'Genre(s)':
        novel.genre = detail.trim().replace(/[\t\n]/g, ',');
        break;
      case 'Author(s)':
        novel.author = detail.trim();
        break;
      case 'Artist(s)':
        novel.status = detail.trim();
        break;
    }
  });

  novel.summary = $('div.summary__content').text();

  let novelChapters = [];

  const novelId = $('.rating-post-id').attr('value');

  let formData = new FormData();
  formData.append('action', 'manga_get_chapters');
  formData.append('manga', novelId);

  const data = await fetch(
    'https://www.lightnovelupdates.com/wp-admin/admin-ajax.php',
    {
      method: 'POST',
      body: formData,
    },
  );
  const text = await data.text();

  $ = cheerio.load(text);

  $('.wp-manga-chapter').each(function () {
    const chapterName = $(this).find('a').text().trim();
    const releaseDate = $(this).find('span').text().trim();
    const chapterUrl = $(this).find('a').attr('href');

    const chapter = {chapterName, releaseDate, chapterUrl};

    novelChapters.push(chapter);
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const chapterName = '';
  const chapterText = (
    await NovelUpdatesScraper.parseChapter(novelUrl, chapterUrl)
  ).chapterText;

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
  const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga&m_orderby=rating`;

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novels = [];

  $('.c-tabs-item__content').each(function (result) {
    const novelName = $(this).find('.h4 > a').text();
    const novelCover = $(this).find('img').attr('src');
    const novelUrl = $(this).find('.h4 > a').attr('href');

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

const LightNovelUpdatesScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default LightNovelUpdatesScraper;
