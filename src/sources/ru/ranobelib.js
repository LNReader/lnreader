import cheerio from 'react-native-cheerio';

const sourceId = 93;
const sourceName = 'RanobeLib';

const baseUrl = 'https://ranobelib.me/';

const popularNovels = async page => {
  const totalPages = 29;
  const url = `${baseUrl}manga-list?sort=rate&dir=desc&page=${page}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.media-card-wrap').each(function () {
    const novelName = loadedCheerio(this).find('.media-card__title').text();
    const novelCover = loadedCheerio(this)
      .find('a.media-card')
      .attr('data-src');
    const novelUrl = loadedCheerio(this).find('a.media-card').attr('href');

    const novel = {sourceId, novelName, novelCover, novelUrl};

    novels.push(novel);
  });

  return {totalPages, novels};
};

const parseNovelAndChapters = async novelUrl => {
  const result = await fetch(novelUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
    novelName: '',
    novelCover: '',
    author: null,
    status: null,
    genre: null,
    summary: null,
    chapters: [],
  };

  novel.novelName = loadedCheerio('.media-name__main').text().trim();

  novel.novelCover = loadedCheerio('.media-sidebar__cover img').attr('src');

  novel.summary = loadedCheerio('.media-description__text').text().trim();

  novel.author = loadedCheerio(
    '#main-page > div > div.container.container_responsive > div > div.media-sidebar > div.media-info-list.paper > a:nth-child(4) > div.media-info-list__value',
  )
    .text()
    .trim();

  let chapters = [];

  let chaptersJson = body.match(
    /window.__DATA__ = [\s\S]*?window._SITE_COLOR_/gm,
  );

  chaptersJson = chaptersJson?.[0]
    ?.replace('window.__DATA__ = ', '')
    ?.replace('window._SITE_COLOR_', '')
    ?.trim()
    ?.slice(0, -1);

  chaptersJson = JSON.parse(chaptersJson);

  const novelSlug = chaptersJson.manga.slug;

  chaptersJson.chapters.list.map(item => {
    const chapterName =
      `Том ${item.chapter_volume} Глава ${item.chapter_number} ${item.chapter_name}`?.trim();
    const releaseDate = item.chapter_created_at;
    const chapterUrl = `${baseUrl}${novelSlug}/v${item.chapter_volume}/c${item.chapter_number}`;

    chapters.push({chapterName, releaseDate, chapterUrl});
  });

  novel.chapters = chapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(chapterUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  loadedCheerio('.reader-container img').each(function () {
    if (!loadedCheerio(this).attr('src')?.startsWith('http')) {
      const src = loadedCheerio(this).attr('src');

      loadedCheerio(this).attr('src', `http://ranobelib.me${src}`);
    }
  });

  const chapterName = loadedCheerio(
    'body > div.reader.reader_text > div.header.header_reader.headroom.headroom--top.headroom--not-bottom > div > a > div:nth-child(3)',
  )
    .text()
    .trim();
  const chapterText = loadedCheerio('.reader-container').html();

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
  const url = `${baseUrl}manga-list?sort=rate&dir=desc&page=1&name=${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.media-card-wrap').each(function () {
    const novelName = loadedCheerio(this).find('.media-card__title').text();
    const novelCover = loadedCheerio(this)
      .find('a.media-card')
      .attr('data-src');
    const novelUrl = loadedCheerio(this).find('a.media-card').attr('href');

    const novel = {sourceId, novelName, novelCover, novelUrl};

    novels.push(novel);
  });

  return novels;
};

const RanobeLibScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default RanobeLibScraper;
