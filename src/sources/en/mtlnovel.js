import cheerio from 'react-native-cheerio';

const baseUrl = 'https://www.mtlnovel.com';

const popularNovels = async page => {
  let totalPages = 10;
  const url = `${baseUrl}/alltime-rank/page/${page}`;

  // console.log(url);

  let headers = new Headers({
    referer: 'https://www.mtlnovel.com/',
    'User-Agent':
      "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
  });

  const result = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.box.wide').each(function () {
    const novelName = loadedCheerio(this).find('a.list-title').text().slice(4);
    const novelCover = loadedCheerio(this).find('amp-img').attr('src');

    let novelUrl = loadedCheerio(this).find('a.list-title').attr('href');
    novelUrl = novelUrl.replace('https://www.mtlnovel.com/', '');

    const novel = {
      sourceId: 5,
      novelUrl,
      novelName,
      novelCover,
    };

    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}/${novelUrl}`;

  let headers = new Headers({
    referer: 'https://www.mtlnovel.com/alltime-rank/',
    'User-Agent':
      "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
  });

  const result = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 5;

  novel.sourceName = 'MTLNovel';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('h1.entry-title').text();

  novel.novelCover = loadedCheerio('.nov-head > amp-img').attr('src');

  novel.summary = loadedCheerio('div.desc > h2').next().text().trim();

  novel.author = loadedCheerio('tr > td')
    .filter(function () {
      return loadedCheerio(this).prev().text().trim() === 'Author';
    })
    .next()
    .text()
    .replace('Auhtor:', '');

  novel.status = loadedCheerio('tr > td')
    .filter(function () {
      return loadedCheerio(this).prev().text().trim() === 'Status';
    })
    .next()
    .text()
    .replace('Status:', '');

  novel.genre = loadedCheerio('td')
    .filter(function () {
      return loadedCheerio(this).prev().text().trim() === 'Genre';
    })
    .next()
    .text()
    .replace('Genre:', '');

  novel.artist = null;

  const chapterListUrl = url + '/chapter-list/';

  const getChapters = async () => {
    const listResult = await fetch(chapterListUrl);
    const listBody = await listResult.text();

    loadedCheerio = cheerio.load(listBody);

    let novelChapters = [];

    loadedCheerio('div.ch-list')
      .find('a.ch-link')
      .each(function () {
        const chapterName = loadedCheerio(this).text().replace('~ ', '');
        const releaseDate = null;

        let chapterUrl = loadedCheerio(this).attr('href');
        chapterUrl = chapterUrl.replace(
          `https://www.mtlnovel.com/${novelUrl}`,
          '',
        );

        novelChapters.push({
          chapterUrl,
          chapterName,
          releaseDate,
        });
      });
    return novelChapters.reverse();
  };

  novel.chapters = await getChapters();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}/${novelUrl}${chapterUrl}`;
  // console.log(url);

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1.main-title').text();
  let chapterText = loadedCheerio('div.par').html();
  const chapter = {
    sourceId: 5,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const searchUrl =
    'https://www.mtlnovel.com/wp-admin/admin-ajax.php?action=autosuggest&q=' +
    searchTerm +
    '&__amp_source_origin=https%3A%2F%2Fwww.mtlnovel.com';

  const res = await fetch(searchUrl);
  const result = await res.json();

  let novels = [];

  result.items[0].results.map(item => {
    const novelName = item.title.replace(/<\/?strong>/g, '');
    const novelCover = item.thumbnail;
    const novelUrl = item.permalink.replace('https://www.mtlnovel.com/', '');

    const novel = { sourceId: 5, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return novels;
};

const mtlNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default mtlNovelScraper;
