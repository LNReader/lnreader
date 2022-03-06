import cheerio from 'react-native-cheerio';

const sourceId = 81;
const baseUrl = 'https://id.mtlnovel.com';

const popularNovels = async page => {
  let totalPages = 10;
  const url = `${baseUrl}/alltime-rank/page/${page}`;

  let headers = new Headers({
    referer: 'https://id.mtlnovel.com/',
    'User-Agent':
      "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
  });

  const result = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('div.box.wide').each(function () {
    const novelName = loadedCheerio(this).find('a.list-title').text().slice(4);
    const novelCover = loadedCheerio(this).find('amp-img').attr('src');

    let novelUrl = loadedCheerio(this).find('a.list-title').attr('href');
    novelUrl = novelUrl.replace('https://id.mtlnovel.com/', '');

    const novel = {
      sourceId,
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
    referer: 'https://id.mtlnovel.com/alltime-rank/',
    'User-Agent':
      "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
  });

  const result = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = { sourceId, url, novelUrl };

  novel.sourceName = 'MTLNovel';

  novel.novelName = loadedCheerio('h1.entry-title').text();

  novel.novelCover = loadedCheerio('.nov-head > amp-img').attr('src');

  novel.summary = loadedCheerio('div.desc > h2').next().text();

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
          `https://id.mtlnovel.com/${novelUrl}`,
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

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1.main-title').text();
  let chapterText = loadedCheerio('div.par').html();
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
  const searchUrl =
    'https://id.mtlnovel.com/wp-admin/admin-ajax.php?action=autosuggest&q=' +
    searchTerm +
    '&__amp_source_origin=https%3A%2F%2Fid.mtlnovel.com';

  const res = await fetch(searchUrl);
  const result = await res.text();

  let loadedCheerio = cheerio.load(result);

  let body = JSON.parse(loadedCheerio('body').text());

  let novels = [];

  body.items[0].results.map(item => {
    const novelName = item.title.replace(/<\/?strong>/g, '');
    const novelCover = item.thumbnail;
    const novelUrl = item.permalink.replace('https://id.mtlnovel.com/', '');

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return novels;
};

const IdMtlNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default IdMtlNovelScraper;
