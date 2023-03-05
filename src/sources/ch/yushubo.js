import * as cheerio from 'cheerio';
const baseUrl = 'https://m.yushubo.com';

const popularNovels = async page => {
  const url = `${baseUrl}/all/order/hits_week+desc.html?page=${page}`;

  const result = await fetch(url, {
    headers: {
      'User-Agent':
        "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    },
  });
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.clearfix > li').each(function () {
    const novelUrl =
      loadedCheerio(this)
        .find('a')
        .attr('href')
        .replace('.html', '')
        .substring(1) + '/';

    const novelName = loadedCheerio(this).find('a').text();
    let novelCover = loadedCheerio(this).find('img').attr('src');
    novelCover = novelCover.includes('https://tva1.sinaimg.cn/')
      ? `${novelCover}`
      : `${baseUrl}${novelCover}`;

    const novel = {
      sourceId: 52,
      novelUrl,
      novelName,
      novelCover,
    };

    novels.push(novel);
  });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}/${novelUrl.slice(0, -1)}.html`;

  const result = await fetch(url, {
    headers: {
      'User-Agent':
        "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    },
  });
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 52;

  novel.sourceName = 'Yushubo';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('dd > h2').text();

  novel.novelCover = loadedCheerio('dt > img').attr('src');

  novel.summary = loadedCheerio('div.content > p').text();

  let info = [];
  loadedCheerio('.info a').each(function () {
    info.push(loadedCheerio(this).text());
  });

  novel.genre = info[0];

  novel.author = info[1];

  novel.artist = null;

  novel.status = 'Unknown';

  let chapters = [];

  loadedCheerio('.bookshelf-list #chapter a').each(function () {
    let chapterUrl = loadedCheerio(this).attr('href').substring(1);
    let chapterName = loadedCheerio(this).text();
    let releaseDate = null;

    chapters.push({
      chapterName,
      releaseDate,
      chapterUrl,
    });
  });

  novel.chapters = chapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}/${chapterUrl}`;

  const result = await fetch(url, {
    headers: {
      'User-Agent':
        "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    },
  });
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.read-section h3').text();
  let chapterText = loadedCheerio('.read-section').html();

  const chapter = {
    sourceId: 52,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const searchUrl = `${baseUrl}/so.html`;

  const result = await fetch(searchUrl, {
    method: 'post',
    body: JSON.stringify({ ss: searchTerm }),
    headers: {
      'User-Agent':
        "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
      'Content-Type': 'application/json',
    },
  });

  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.clearfix > li').each(function () {
    let novelUrl =
      loadedCheerio(this)
        .find('a')
        .attr('href')
        .replace('.html', '')
        .substring(1) + '/';

    const novelName = loadedCheerio(this).find('a').text();
    let novelCover = loadedCheerio(this).find('img').attr('src');
    novelCover = novelCover.includes('https://tva1.sinaimg.cn/')
      ? `${novelCover}`
      : `${baseUrl}${novelCover}`;

    const novel = {
      sourceId: 52,
      novelUrl,
      novelName,
      novelCover,
    };

    novels.push(novel);
  });

  return novels;
};

const YushuboScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default YushuboScraper;
