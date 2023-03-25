import * as cheerio from 'cheerio';
const baseUrl = 'https://woopread.com/';

const popularNovels = async page => {
  let url = baseUrl + 'novellist/page/' + page + '/?m_orderby=rating';

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.page-item-detail').each(function () {
    const novelName = loadedCheerio(this).find('.h5 > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');

    let novelUrl = loadedCheerio(this).find('.h5 > a').attr('href');
    novelUrl = novelUrl.replace(baseUrl + 'series/', '');

    const novel = {
      sourceId: 21,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}series/${novelUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 21;

  novel.sourceName = 'WoopRead';

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
      .trim();
    const detail = loadedCheerio(this).find('.summary-content').text().trim();

    switch (detailName) {
      case 'Genre(s)':
        novel.genre = detail.trim().replace(/[\t\n]/g, ',');
        break;
      case 'Author(s)':
        novel.author = detail.trim();
        break;
      case 'Status':
        novel.status = detail.trim() === 'OnGoing' ? 'Ongoing' : 'Completed';
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

  // console.log(`${url}ajax/chapters/`);
  const data = await fetch(`${url}ajax/chapters/`, { method: 'POST' });
  const text = await data.text();

  loadedCheerio = cheerio.load(text);

  loadedCheerio('.wp-manga-chapter.free-chap').each(function () {
    const chapterName = loadedCheerio(this).find('a').text().trim();
    const releaseDate = loadedCheerio(this)
      .find('span')
      .text()
      .replace('Free', '')
      .trim();
    const chapterUrl = loadedCheerio(this)
      .find('a')
      .attr('href')
      .replace(url, '');

    novelChapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}series/${novelUrl}/${chapterUrl}/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1#chapter-heading').text();

  let chapterText = loadedCheerio('.reading-content').html();

  const chapter = {
    sourceId: 21,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga&op=&author=&artist=&release=&adult=`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.c-tabs-item__content').each(function () {
    const novelName = loadedCheerio(this).find('.h4 > a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');

    let novelUrl = loadedCheerio(this).find('.h4 > a').attr('href');
    novelUrl = novelUrl.replace(`${baseUrl}series/`, '');

    const novel = {
      sourceId: 21,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return novels;
};

const WoopReadScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default WoopReadScraper;
