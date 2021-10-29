import cheerio from 'react-native-cheerio';
import {defaultCoverUri, Status} from '../helpers/constants';

const sourceId = 89;
const sourceName = 'IndoWebNovel';

const baseUrl = 'https://mtlcorner.com/';

const popularNovels = async page => {
  const totalPages = 1;
  const url = `${baseUrl}series/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.wp-block-latest-posts__list li').each(function () {
    const novelName = loadedCheerio(this).find('a').text();
    const novelCover = defaultCoverUri;
    const novelUrl = loadedCheerio(this).find('a').attr('href');

    const novel = {sourceId, novelName, novelCover, novelUrl};

    novels.push(novel);
  });

  return {totalPages, novels};
};

const parseNovelAndChapters = async novelUrl => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
    novelName: '',
    novelCover: '',
    author: '',
    status: '',
    genre: '',
    summary: '',
    chapters: [],
  };

  const novelName = loadedCheerio('.entry-title').text().trim();
  novel.novelName = novelName;

  novel.novelCover = loadedCheerio('figure > img').attr('src');

  novel.summary = loadedCheerio('figcaption').text().trim();

  novel.status = Status.UNKNOWN;

  novel.author = loadedCheerio(
    ' li.post-author.meta-wrapper > span.meta-text > a',
  )
    .text()
    ?.trim();

  let chapters = [];

  loadedCheerio('.lcp_catlist li').each(function () {
    let chapterNameSuffix = loadedCheerio(this)
      .find('a')
      .text()
      ?.trim()
      .match(/([a-zA-Z\s?]+)(\d+)-(\d+)/);

    if (chapterNameSuffix) {
      let chaptersTemp = [];

      let chapterUrlSuffix = loadedCheerio(this).find('a').attr('href');

      let i = chapterNameSuffix[2];

      while (i <= chapterNameSuffix[3]) {
        const chapterName = `${chapterNameSuffix[1].replace(
          novelName,
          '',
        )} ${i}`;
        const chapterUrl = `${chapterUrlSuffix}${i - chapterNameSuffix[2] + 1}`;
        const releaseDate = null;

        chaptersTemp.push({chapterName, releaseDate, chapterUrl});
        i++;
      }

      chapters.push(...chaptersTemp.reverse());
    }
  });

  novel.chapters = chapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  const chapterName = '';
  const chapterText = loadedCheerio('.entry-content').html();

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
  const url = `${baseUrl}series/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.wp-block-latest-posts__list li').each(function () {
    const novelName = loadedCheerio(this).find('a').text();
    const novelCover = defaultCoverUri;
    const novelUrl = loadedCheerio(this).find('a').attr('href');

    const novel = {sourceId, novelName, novelCover, novelUrl};

    if (novelName.toLowerCase().includes(searchTerm.toLowerCase())) {
      novels.push(novel);
    }
  });

  return novels;
};

const MTLCornerScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default MTLCornerScraper;
