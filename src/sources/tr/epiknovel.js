import cheerio from 'react-native-cheerio';

const sourceId = 73;

const sourceName = 'EpikNovel';

const baseUrl = 'https://www.epiknovel.com/';

const popularNovels = async page => {
  let url = baseUrl + 'seri-listesi?Sayfa=' + page;
  const totalPages = 5;

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novels = [];

  $('div.col-lg-12.col-md-12').each(function () {
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

  console.log(novels);

  return {novels, totalPages};
};

const parseNovelAndChapters = async novelUrl => {
  const url = novelUrl;
  console.log(url);

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novel = {sourceId, sourceName, url, novelUrl};

  novel.novelName = $('h1#tables').text().trim();

  novel.novelCover = $('img.manga-cover').attr('src');

  novel.summary = $(
    '#wrapper > div.row > div.col-md-9 > div:nth-child(6) > p:nth-child(3)',
  )
    .text()
    .trim();

  novel.status = $(
    '#wrapper > div.row > div.col-md-9 > div.row > div.col-md-9 > h4:nth-child(3) > a',
  )
    .text()
    .trim();

  novel.author = $('#NovelInfo > p:nth-child(4)')
    .text()
    .replace(/Publisher:|\s/g, '')
    .trim();

  let novelChapters = [];

  $('table').find('tr').first().remove();

  $('table')
    .find('tr')
    .each(function () {
      const releaseDate = $(this).find('td:nth-child(3)').text();

      let chapterName = $(this).find('td:nth-child(1) > a').text();

      if ($(this).find('td:nth-child(1) > span').length > 0) {
        chapterName = '🔒 ' + chapterName;
      }

      const chapterUrl = $(this).find(' td:nth-child(1) > a').attr('href');

      novelChapters.push({
        chapterName,
        chapterUrl,
        releaseDate,
      });
    });

  novel.chapters = novelChapters;
  console.log(novel);

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  console.log(url);

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let chapterName, chapterText;

  if (result.url == 'https://www.epiknovel.com/login') {
    chapterName = '';
    chapterText = 'Premium Chapter';
  } else {
    chapterName = $('#icerik > center > h4 > b').text();
    chapterText = $('div#icerik').html();
  }

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
  const url = baseUrl + 'seri-listesi?q=' + searchTerm;

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novels = [];

  $('div.col-lg-12.col-md-12').each(function () {
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

const EpikNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default EpikNovelScraper;
