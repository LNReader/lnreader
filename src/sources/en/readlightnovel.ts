import * as cheerio from 'cheerio';
import { SourceChapter, SourceChapterItem, SourceNovelItem } from '../types';
import { SourceFilter } from '../types/filterTypes';

const sourceId = 2;
const sourceName = 'ReadLightNovel';
const baseUrl = 'https://www.readlightnovel.me';
const searchUrl = 'https://www.readlightnovel.me/detailed-search-rln';

const popularNovels = async (page: number, showLatestNovels?: boolean) => {
  let totalPages = 1751;
  const url = `${baseUrl}/top-novels/${
    showLatestNovels ? 'new' : 'most-viewed'
  }/${page}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels: SourceNovelItem[] = [];

  loadedCheerio('.top-novel-block').each(function () {
    const novelUrl = loadedCheerio(this)
      .find('h2 > a')
      .attr('href')
      ?.replace(`${baseUrl}/`, '');

    if (novelUrl) {
      const novelName = loadedCheerio(this).find('h2 > a').text();
      const novelCover = loadedCheerio(this).find('img').attr('src');

      const novel = {
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    }
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl: string) => {
  const url = `${baseUrl}/${novelUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novel;

  const novelName = loadedCheerio('.block-title > h1').text();

  const novelCover = loadedCheerio('.novel-cover > a > img').attr('src');

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
      case 'Author(s)':
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

  loadedCheerio('.panel').each(function () {
    let volumeName = loadedCheerio(this).find('h4.panel-title').text();

    loadedCheerio(this)
      .find('ul.chapter-chs > li')
      .each(function () {
        const chapterUrl = loadedCheerio(this)
          .find('a')
          .attr('href')
          ?.replace(`${baseUrl}/${novelUrl}/`, '');

        if (chapterUrl) {
          let chapterName = loadedCheerio(this).find('a').text();

          const releaseDate = null;

          if (volumeName.includes('Volume')) {
            chapterName = volumeName + ' ' + chapterName;
          }

          const chapter = {
            chapterName,
            releaseDate,
            chapterUrl,
          };

          chapters.push(chapter);
        }
      });
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
  const url = `${baseUrl}/${novelUrl}/${chapterUrl}/`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  loadedCheerio('.block-title > h1').find('a').remove();

  const chapterName = loadedCheerio('.block-title > h1')
    .text()
    .replace(' - ', '');

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

  const chapterText = loadedCheerio('.desc').html() || '';

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
  const formData = new FormData();
  formData.append('keyword', searchTerm);
  formData.append('search', 1);

  const result = await fetch(searchUrl, {
    method: 'POST',
    body: formData,
  });
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  let novels: SourceNovelItem[] = [];

  loadedCheerio('.top-novel-block').each(function () {
    const novelUrl = loadedCheerio(this)
      .find('.top-novel-header > h2 > a')
      .attr('href')
      ?.replace(`${baseUrl}/`, '');

    if (novelUrl) {
      const novelName = loadedCheerio(this)
        .find('.top-novel-header > h2 > a')
        .text();
      const novelCover = loadedCheerio(this).find('img').attr('src');

      const novel = {
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    }
  });

  return novels;
};

export const filters: SourceFilter[] = [];

const ReadLightNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default ReadLightNovelScraper;
