import cheerio from 'react-native-cheerio';

const baseUrl = 'http://www.novelawuxia.com/';

function getNovelName(y) {
  return y.replace(/-/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());
}

const popularNovels = async page => {
  let totalPages = 1;
  let url = baseUrl + 'p/todas-las-novelas.html';

  let headers = new Headers({
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

  loadedCheerio('.post-body.entry-content')
    .find('a')
    .each(function () {
      let novelName = loadedCheerio(this)
        .attr('href')
        .split('/')
        .pop()
        .replace('.html', '');
      novelName = getNovelName(novelName);
      const novelCover = loadedCheerio(this).find('img').attr('src');

      let novelUrl = loadedCheerio(this).attr('href');
      novelUrl = novelUrl.replace(`${baseUrl}p/`, '') + '/';

      const novel = {
        sourceId: 31,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}p/${novelUrl.replace('/', '')}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 31;

  novel.sourceName = 'Novela Wuxia';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('h1.post-title').text().trim();

  novel.novelCover = loadedCheerio('div.separator').find('a').attr('href');

  novel.artist = '';
  novel.status = '';

  loadedCheerio('div > b').each(function () {
    const detailName = loadedCheerio(this).text();
    let detail = loadedCheerio(this)[0].nextSibling;

    if (detailName && detail) {
      detail = detail.nodeValue;

      if (detailName.includes('Autor')) {
        novel.author = detail.replace('Autor:', '');
      }

      if (detailName.includes('Estatus')) {
        novel.status = detail.replace('Estatus: ', '');
      }
      if (detailName.includes('Géneros:')) {
        novel.genre = detail.replace('Géneros: ', '').replace(/,\s/g, ',');
      }
    }
  });

  let novelChapters = [];

  loadedCheerio('div').each(function () {
    const detailName = loadedCheerio(this).text();
    if (detailName.includes('Sinopsis')) {
      novel.summary =
        loadedCheerio(this).next().text() !== ''
          ? loadedCheerio(this).next().text().replace('Sinopsis', '').trim()
          : loadedCheerio(this)
              .next()
              .next()
              .text()
              .replace('Sinopsis', '')
              .trim();
    }

    if (detailName.includes('Lista de Capítulos')) {
      loadedCheerio(this)
        .find('a')
        .each(function (res) {
          const chapterName = loadedCheerio(this).text();
          let chapterUrl = loadedCheerio(this).attr('href');
          const releaseDate = null;

          if (
            chapterName &&
            chapterUrl &&
            chapterUrl.includes(novelUrl.replace('.html', '')) &&
            !novelChapters.some(chap => chap.chapterName === chapterName)
          ) {
            chapterUrl = chapterUrl.replace(baseUrl, '');

            const chapter = {
              chapterName,
              releaseDate,
              chapterUrl,
            };

            novelChapters.push(chapter);
          }
        });
    }
  });

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}${novelUrl}/${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('h1.post-title').text().trim();

  let chapterText = loadedCheerio('.post-body.entry-content').html();
  novelUrl = novelUrl + '/';
  chapterUrl = chapterUrl + '/';

  const chapter = {
    sourceId: 31,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `${baseUrl}search?q=${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.date-outer').each(function () {
    let novelName = loadedCheerio(this)
      .find('a')
      .attr('href')
      .split('/')
      .pop()
      .replace(/-capitulo(.*?).html/, '');

    const novelUrl = novelName + '.html/';

    novelName = getNovelName(novelName);

    const exists = novels.some(novel => novel.novelName === novelName);

    if (!exists) {
      const novelCover = null;
      const novel = {
        sourceId: 31,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    }
  });

  return novels;
};

const NovelaWuxiaScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NovelaWuxiaScraper;
