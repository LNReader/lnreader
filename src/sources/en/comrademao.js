import cheerio from 'react-native-cheerio';

const sourceId = 27;

const sourceName = 'Comrade Mao';

const baseUrl = 'https://comrademao.com/';

const popularNovels = async page => {
  let url = baseUrl + 'novel/page/' + page;
  const totalPages = 111;

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novels = [];

  $('div.container')
    .find('section')
    .each(function () {
      const novelName = $(this)
        .find('div.columns > div:nth-child(2) > a')
        .text();
      const novelCover = $(this).find('img').attr('src');

      let novelUrl = $(this)
        .find('div.columns > div:nth-child(2) > a')
        .attr('href');
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
  console.log(url);

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novel = {sourceId, sourceName, url, novelUrl};

  novel.novelName = $(
    '#NovelInfo > div > div.column.is-one-third.has-text-centered > p',
  )
    .text()
    .trim();

  novel.novelCover = $('img.attachment-post-thumbnail').attr('src');

  novel.summary = $('#NovelInfo > div > div:nth-child(2) > p').text().trim();

  novel.genre = $('#NovelInfo > p:nth-child(2)')
    .text()
    .replace(/Genre(s):|\s/g, '');

  novel.status = $('#NovelInfo > p:nth-child(5)')
    .text()
    .replace(/Status:|\s/g, '')
    .trim();

  novel.author = $('#NovelInfo > p:nth-child(4)')
    .text()
    .replace(/Publisher:|\s/g, '')
    .trim();

  let novelChapters = [];

  // $("table > tbody")
  //     .find("tr")
  //     .each(function () {
  //         const releaseDate = $(this).find("span").text();

  //         const chapterName = $(this).find("a").text();
  //         const chapterUrl = $(this).find("a").attr("href").split("/")[5];

  //         novelChapters.push({
  //             chapterName,
  //             chapterUrl,
  //             releaseDate,
  //         });
  //     });

  // $("small").remove();

  let chapterUrlPrefix = $('table > tbody')
    .find('tr')
    .first()
    .find('a')
    .attr('href')
    .slice(0, -1)
    .split('/')
    .pop()
    .split('-');

  chapterUrlPrefix.pop();

  chapterUrlPrefix = chapterUrlPrefix.join('-').toLowerCase();

  let latestChapter = $('table > tbody')
    .find('tr')
    .first()
    .find('a')
    .text()
    .replace(/^\D+/g, '');

  for (let i = 1; i <= latestChapter; i++) {
    const chapterName = 'Chapter ' + i;
    const releaseDate = null;
    const chapterUrl = chapterUrlPrefix + '-' + i + '/';

    const chapter = {
      chapterName,
      releaseDate,
      chapterUrl,
    };

    novelChapters.push(chapter);
  }

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}mtl/${novelUrl}/${chapterUrl}`;

  console.log(url);

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let chapterName = '';

  let chapterText = $('#content').html();

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
  const url = baseUrl + '?s=' + searchTerm + '&post_type=novel';

  const result = await fetch(url);
  const body = await result.text();

  $ = cheerio.load(body);

  let novels = [];

  $('.newbox')
    .find('li')
    .each(function () {
      const novelName = $(this).find('h3').text();
      const novelCover = $(this).find('img').attr('src');

      let novelUrl = $(this).find('a').attr('href');
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

const ComradeMaoScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default ComradeMaoScraper;
