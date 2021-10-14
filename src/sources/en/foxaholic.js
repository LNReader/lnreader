import cheerio from 'react-native-cheerio';

const baseUrl = 'https://foxaholic.com/';

const popularNovels = async page => {
  let totalPages = 5;
  let url = baseUrl + 'novel/page/' + page + '/?m_orderby=rating';

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.page-item-detail').each(function () {
    const novelName = loadedCheerio(this).find('.h5 > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');

    let novelUrl = loadedCheerio(this)
      .find('.h5 > a')
      .attr('href')
      .split('/')[4];
    novelUrl += '/';

    const novel = {
      sourceId: 22,
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

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 22;

  novel.sourceName = 'Foxaholic';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('.post-title > h1')
    .text()
    .replace(/[\t\n]/g, '')
    .trim();

  novel.novelCover = loadedCheerio('.summary_image > a > img').attr('data-src');

  loadedCheerio('.post-content_item').each(function () {
    const detailName = loadedCheerio(this)
      .find('.summary-heading > h5')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();
    const detail = loadedCheerio(this)
      .find('.summary-content')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();

    switch (detailName) {
      case 'Genre':
        novel.genre = detail.trim().replace(/[\t\n]/g, ',');
        break;
      case 'Author':
        novel.author = detail.trim();
        break;
      case 'Novel':
        novel.status = detail.trim();
        break;
    }
  });

  loadedCheerio('.description-summary > div.summary__content')
    .find('em')
    .remove();

  novel.summary = loadedCheerio('.description-summary > div.summary__content')
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

  loadedCheerio = cheerio.load(text);

  loadedCheerio('.wp-manga-chapter').each(function () {
    const chapterName = loadedCheerio(this)
      .find('a')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();

    const releaseDate = loadedCheerio(this).find('span').text().trim();

    let chapterUrl = loadedCheerio(this).find('a').attr('href').split('/');

    chapterUrl[6]
      ? (chapterUrl = chapterUrl[5] + '/' + chapterUrl[6])
      : (chapterUrl = chapterUrl[5]);

    novelChapters.push({chapterName, releaseDate, chapterUrl});
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}novel/${novelUrl}${chapterUrl}/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1#chapter-heading').text();
  let chapterText = loadedCheerio('.reading-content').html();
  const chapter = {
    sourceId: 22,
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

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.c-tabs-item__content').each(function () {
    const novelName = loadedCheerio(this).find('.h4 > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');

    let novelUrl = loadedCheerio(this)
      .find('.h4 > a')
      .attr('href')
      .split('/')[4];
    novelUrl += '/';
    const novel = {
      sourceId: 22,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return novels;
};

const FoxaHolicScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default FoxaHolicScraper;
