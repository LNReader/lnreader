import QueryString from 'qs';
import cheerio from 'react-native-cheerio';

const sourceId = 68;

const sourceName = 'Readwn.com';

const baseUrl = 'https://www.readwn.com/';

const popularNovels = async page => {
  let url = `${baseUrl}list/all/all-onclick-${page - 1}.html`;
  const totalPages = 281;

  const headers = new Headers({
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
  });

  const result = await fetch(url, {method: 'GET', headers});
  const body = await result.text();

  // console.log(body);

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('li.novel-item').each(function () {
    const novelName = loadedCheerio(this).find('h4').text();
    const novelUrl = loadedCheerio(this)
      .find('a')
      .attr('href')
      .split('/')
      .pop();

    const novelCover =
      baseUrl + loadedCheerio(this).find('.novel-cover > img').attr('data-src');

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
  const url = `${baseUrl}novel/${novelUrl}`;

  const headers = new Headers({
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
  });

  const result = await fetch(url, {method: 'GET', headers});
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
  };

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('h1.novel-title').text();

  novel.novelCover =
    baseUrl + loadedCheerio('figure.cover > img').attr('data-src');

  novel.summary = loadedCheerio('p.description').text().trim();

  novel.genre = '';

  loadedCheerio('div.categories > ul > li').each(function () {
    novel.genre += loadedCheerio(this).text().trim() + ',';
  });

  loadedCheerio('div.header-stats > span').each(function () {
    if (loadedCheerio(this).find('small').text() === 'Status') {
      novel.status = loadedCheerio(this).find('strong').text();
    }
  });

  novel.genre = novel.genre.slice(0, -1);

  novel.author = loadedCheerio('span[itemprop=author]').text();

  let novelChapters = [];

  const novelId = novelUrl.split('/').pop().replace('.html', '');

  const latestChapterNumber = loadedCheerio('.header-stats')
    .find('span > strong')
    .first()
    .text()
    .trim();

  for (let i = 1; i <= latestChapterNumber; i++) {
    const chapterName = `Chapter ${i}`;
    const chapterUrl = `${novelId}_${i}`;
    const releaseDate = null;

    const chapter = {chapterName, releaseDate, chapterUrl};

    novelChapters.push(chapter);
  }

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}novel/${chapterUrl}.html`;

  const headers = new Headers({
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
  });

  const result = await fetch(url, {method: 'GET', headers});
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.titles > h2').text();
  let chapterText = loadedCheerio('.chapter-content').html();

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
  const searchUrl = 'https://www.readwn.com/e/search/index.php';

  const result = await fetch(searchUrl, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'https://www.readwn.com/search.html',
      Origin: 'https://www.readwn.com',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
    },
    method: 'POST',
    body: QueryString.stringify({
      show: 'title',
      tempid: 1,
      tbname: 'news',
      keyboard: searchTerm,
    }),
  });
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('li.novel-item').each(function () {
    const novelName = loadedCheerio(this).find('h4').text();
    const novelCover = baseUrl + loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this)
      .find('a')
      .attr('href')
      .split('/')
      .pop();

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

const ReadwnScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default ReadwnScraper;
