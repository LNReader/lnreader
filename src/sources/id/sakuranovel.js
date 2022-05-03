import * as cheerio from 'cheerio';

const sourceId = 103;
const sourceName = 'SakuraNovel';

const baseUrl = 'https://sakuranovel.id/';

const popularNovels = async page => {
  const totalPages = 8;
  const url = `${baseUrl}advanced-search/page/${page}/?title&author&yearx&status&type&order=rating&country%5B0%5D=china&country%5B1%5D=jepang&country%5B2%5D=unknown`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.flexbox2-item').each(function () {
    const novelName = loadedCheerio(this)
      .find('.flexbox2-title span')
      .first()
      .text();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');
    const novelUrl = loadedCheerio(this)
      .find('.flexbox2-content > a')
      .attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const result = await fetch(novelUrl);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
  };

  novel.novelName = loadedCheerio('.series-title h2').text().trim();

  novel.novelCover = loadedCheerio('.series-thumb img').attr('data-src');

  novel.summary = loadedCheerio('.series-synops').text().trim();

  let chapters = [];

  loadedCheerio('.series-chapterlist li').each(function () {
    const chapterName = loadedCheerio(this)
      .find('a span')
      .first()
      .text()
      .replace(`${novel.novelName} – `, '')
      .replace('Bahasa Indonesia', '')
      .replace(/\s+/g, ' ')
      .trim();

    const releaseDate = loadedCheerio(this)
      .find('a span')
      .first()
      .next()
      .text();
    const chapterUrl = loadedCheerio(this).find('a').attr('href');

    chapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = chapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(chapterUrl);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('.title-chapter').text();
  const chapterText = loadedCheerio('.reader-area').html();

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
  const url = `${baseUrl}?s=${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.flexbox2-item').each(function () {
    const novelName = loadedCheerio(this)
      .find('.flexbox2-title span')
      .first()
      .text();
    const novelCover = loadedCheerio(this).find('img').attr('data-src');
    const novelUrl = loadedCheerio(this)
      .find('.flexbox2-content > a')
      .attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return novels;
};

const SakuraNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default SakuraNovelScraper;
