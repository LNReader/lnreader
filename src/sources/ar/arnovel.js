import cheerio from 'react-native-cheerio';

const sourceId = 59;
const sourceName = 'ArNovel';

const baseUrl = 'https://arnovel.me/';

const popularNovels = async page => {
  let totalPages = 21;
  let url = baseUrl + 'novels/page/' + page;

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novels = [];

  $('.page-item-detail').each(function () {
    const novelName = $(this).find('.h5 > a').text();
    const novelCover =
      'https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true';

    let novelUrl = $(this).find('.h5 > a').attr('href').split('/')[4];

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
  const url = `${baseUrl}novel/${novelUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novel = {sourceId, sourceName, url, novelUrl};

  novel.novelName = $('.post-title > h1')
    .text()
    .replace(/[\t\n]/g, '')
    .trim();

  novel.novelCover =
    'https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true';

  $('.post-content_item').each(function () {
    detailName = $(this)
      .find('.summary-heading > h5')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();
    detail = $(this)
      .find('.summary-content')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();

    switch (detailName) {
      case 'التصنيفات':
        novel.genre = detail.trim().replace(/[\t\n]/g, ',');
        break;
      case 'المؤلف (ين)':
        novel.author = detail.trim();
        break;
      case 'الحالة':
        novel.status = detail.trim();
        break;
    }
  });

  $('.description-summary > div.summary__content').find('em').remove();

  novel.summary = $('.description-summary > div.summary__content')
    .text()
    .trim();

  let novelChapters = [];

  // const novelId = $('#manga-chapters-holder').attr('data-id');

  // let formData = new FormData();
  // formData.append('action', 'manga_get_chapters');
  // formData.append('manga', novelId);

  const data = await fetch(`${url}ajax/chapters/`, {
    method: 'POST',
  });
  const text = await data.text();

  $ = cheerio.load(text);

  $('.wp-manga-chapter').each(function () {
    chapterName = $(this)
      .find('a')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();

    releaseDate = $(this).find('span').text().trim();

    chapterUrl = $(this).find('a').attr('href').split('/');

    chapterUrl[6]
      ? (chapterUrl = chapterUrl[5] + '/' + chapterUrl[6])
      : (chapterUrl = chapterUrl[5]);

    novelChapters.push({chapterName, releaseDate, chapterUrl});
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}novel/${novelUrl}/${chapterUrl}/`;

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  const chapterName = $('h1#chapter-heading').text();
  const chapterText = $('.reading-content').html();

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

  $ = cheerio.load(body);

  let novels = [];

  $('.c-tabs-item__content').each(function () {
    const novelName = $(this).find('.h4 > a').text();
    const novelCover =
      'https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true';

    let novelUrl = $(this).find('.h4 > a').attr('href').split('/')[4];

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
