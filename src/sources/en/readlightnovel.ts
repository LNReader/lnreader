import * as cheerio from 'cheerio';
import { defaultTo } from 'lodash';
import { SourceOptions } from '../sourceManager';
import { SourceChapter, SourceChapterItem, SourceNovelItem } from '../types';
import { FilterInputs, SourceFilter } from '../types/filterTypes';

const sourceId = 2;
const sourceName = 'ReadLightNovel';
const baseUrl = 'https://www.readlightnovel.me';
const searchUrl = 'https://www.readlightnovel.me/detailed-search-rln';

const popularNovels = async (page: number, options?: SourceOptions) => {
  const url = `${baseUrl}/${
    options?.filters?.genre ? 'genre/' + options?.filters?.genre : 'top-novels'
  }/${
    options?.showLatestNovels
      ? 'new'
      : defaultTo(options?.filters?.sort, 'most-viewed')
  }/${page}`;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const novels: SourceNovelItem[] = [];

  let totalPages: string | number | undefined = loadedCheerio(
    '.pagination.pull-right > li',
  )
    .last()
    .find('a')
    .attr('href')
    ?.split('/')
    .pop();

  totalPages = Number(totalPages) || 1;

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
      .find('.novel-detail-header ')
      .text()
      .trim();
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

export const filters: SourceFilter[] = [
  {
    inputType: FilterInputs.Picker,
    key: 'genre',
    label: 'Genre ',
    values: [
      { label: 'Any', value: '' },
      { label: 'Action', value: 'action' },
      { label: 'Adventure', value: 'adventure' },
      { label: 'Billionaire', value: 'billionaire' },
      { label: 'Boys Love', value: 'boys-love' },
      { label: 'Celebrity', value: 'celebrity' },
      { label: 'Comedy', value: 'comedy' },
      { label: 'Dark Fantasy', value: 'dark-fantasy' },
      { label: 'Drama', value: 'drama' },
      { label: 'Ecchi', value: 'ecchi' },
      { label: 'Fantasy', value: 'fantasy' },
      { label: 'Games', value: 'games' },
      { label: 'Gender Bender', value: 'gender-bender' },
      { label: 'Harem', value: 'harem' },
      { label: 'Historical', value: 'historical' },
      { label: 'Horror', value: 'horror' },
      { label: 'Isekai', value: 'isekai' },
      { label: 'Josei', value: 'josei' },
      { label: 'LitRPG', value: 'litrpg' },
      { label: 'Magic', value: 'magic' },
      { label: 'Magical Realism', value: 'magical-realism' },
      { label: 'Martial Arts', value: 'martial-arts' },
      { label: 'Mature', value: 'mature' },
      { label: 'Mecha', value: 'mecha' },
      { label: 'Military', value: 'military' },
      { label: 'Modern Life', value: 'modern-life' },
      { label: 'Mystery', value: 'mystery' },
      { label: 'Psychoical', value: 'psychoical' },
      { label: 'Recarnation', value: 'recarnation' },
      { label: 'Romance', value: 'romance' },
      { label: 'School Life', value: 'school-life' },
      { label: 'Sci-fi', value: 'sci-fi' },
      { label: 'Seinen', value: 'seinen' },
      { label: 'Shotacon', value: 'shotacon' },
      { label: 'Shoujo', value: 'shoujo' },
      { label: 'Shoujo Ai', value: 'shoujo-ai' },
      { label: 'Shounen', value: 'shounen' },
      { label: 'Shounen Ai', value: 'shounen-ai' },
      { label: 'Slice of Life', value: 'slice-of-life' },
      { label: 'Smut', value: 'smut' },
      { label: 'Sports', value: 'sports' },
      { label: 'Supernatural', value: 'supernatural' },
      { label: 'Tragedy', value: 'tragedy' },
      { label: 'Urban Life', value: 'urban-life' },
      { label: 'Urban Life', value: 'urban-life' },
      { label: 'Virtual Reality', value: 'virtual-reality' },
      { label: 'War', value: 'war' },
      { label: 'Wuxia', value: 'wuxia' },
      { label: 'Xianxia', value: 'xianxia' },
      { label: 'Xuanhuan', value: 'xuanhuan' },
      { label: 'Yaoi', value: 'yaoi' },
      { label: 'Yuri', value: 'yuri' },
    ],
  },
  {
    inputType: FilterInputs.Picker,
    key: 'sort',
    label: 'Sort By',
    values: [
      { label: 'Most Viewed', value: 'most-viewed' },
      { label: 'Top Rated', value: 'top-rated' },
      { label: 'New', value: 'new' },
    ],
  },
];

const ReadLightNovelScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default ReadLightNovelScraper;
