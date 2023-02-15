import * as cheerio from 'cheerio';
import { SourceChapter, SourceChapterItem, SourceNovelItem } from '../types';

const sourceId = 109;
const sourceName = 'ReadFreeNovel';
const baseUrl = 'https://www.readfreenovel.com';

const popularNovels = async (page: number) => {
  let totalPages = page;
  const url = `${baseUrl}/s/search.html`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels: SourceNovelItem[] = [];

  loadedCheerio('.books > a').each(function () {
    const novelUrl = loadedCheerio(this).attr('href');

    const novelName = loadedCheerio(this)
      .find('div.b > p:nth-child(1) > i')
      .text();
    const novelCover = baseUrl + loadedCheerio(this).find('img').attr('src');

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl: string) => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel;

  const novelName = loadedCheerio('.block-title > h1').text();

  const novelCover = loadedCheerio('img').attr('src');

  let author, artist, genre, summary, status;

  loadedCheerio('.novel-detail-item').each(function () {
    const detailName = loadedCheerio(this)
      .find('.novel-detail-header > h6')
      .text();
    const detail = loadedCheerio(this).find('.novel-detail-body').text().trim();

    switch (detailName) {
      case 'Genre':
        genre = detail.trim().replace(/\s{2,}/g, ',');

        break;
      case 'Author':
        author = detail;
        break;
      case 'Artist(s)':
        artist = detail;
        break;
      case 'Description':
        summary = detail;
        break;
      case 'Status':
        status = detail;
        break;
    }
  });

  let chapters: SourceChapterItem[] = [];

  loadedCheerio('.l > a').each(function () {
    const chapterUrl = baseUrl + loadedCheerio(this).attr('href');

    let chapterName = loadedCheerio(this).text();

    const releaseDate = null;

    const chapter = {
      chapterName,
      releaseDate,
      chapterUrl,
    };

    chapters.push(chapter);
  });

  novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
    novelName,
    novelCover,
    genre,
    author,
    status,
    artist,
    summary,
    chapters,
  };

  return novel;
};

const parseChapter = async (novelUrl: string, chapterUrl: string) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('b.t').text();

  loadedCheerio('.alert').remove();
  loadedCheerio('.hidden').remove();
  loadedCheerio('iframe').remove();
  loadedCheerio('button').remove();
  loadedCheerio('.hid').remove();
  loadedCheerio('center').remove();
  loadedCheerio(
    'div[style="float: left; margin-top: 20px; font-style: italic;margin-left: 50px; font-size: 14px;"]',
  ).remove();
  loadedCheerio(
    'div[style="float:left;margin-top:15px;margin-bottom:15px;"]',
  ).remove();

  const chapterText =
    loadedCheerio('main > article > :nth-child(3)').html() || '';

  const chapter: SourceChapter = {
    sourceId: 2,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async (searchTerm: string) => {
  const url = `${baseUrl}/s/search.html?q=${searchTerm}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels: SourceNovelItem[] = [];

  loadedCheerio('.books > a').each(function () {
    const novelUrl = loadedCheerio(this).attr('href');

    const novelName = loadedCheerio(this)
      .find('div.b > p:nth-child(1) > i')
      .text();
    const novelCover = baseUrl + loadedCheerio(this).find('img').attr('src');

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return { novels };
};

const ReadFreeNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default ReadFreeNovelScraper;
