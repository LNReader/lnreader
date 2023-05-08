import * as cheerio from 'cheerio';
import { fetchApi, fetchHtml } from '@utils/fetch/fetch';
import { defaultTo } from 'lodash-es';
import { SourceOptions } from '../sourceManager';
import {
  SourceChapter,
  SourceChapterItem,
  SourceNovel,
  SourceNovelItem,
} from '../types';
import { FilterInputs, SourceFilter } from '../types/filterTypes';

const sourceId = 35;
const sourceName = 'Scribble Hub';
const baseUrl = 'https://www.scribblehub.com/';

const popularNovels = async (page: number, options?: SourceOptions) => {
  const url = `${baseUrl}${
    options?.showLatestNovels
      ? 'latest-series/?'
      : 'series-ranking/?sort=' +
        defaultTo(options?.filters?.sort, '1') +
        '&order=' +
        defaultTo(options?.filters?.order, '4')
  }${
    options?.filters?.genreInclude
      ? '&gi=' + options?.filters?.genreInclude
      : ''
  }${
    options?.filters?.genreExclude
      ? '&ge=' + options?.filters?.genreExclude
      : ''
  }${'&mgi=' + defaultTo(options?.filters?.andOr, 'or')}&pg=${page}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  const novels: SourceNovelItem[] = [];

  loadedCheerio('div.search_main_box').each(function () {
    const novelName = loadedCheerio(this).find('div.search_title > a').text();
    const novelCover = loadedCheerio(this)
      .find('div.search_img > img')
      .attr('src');

    let novelUrl: any = loadedCheerio(this)
      .find('div.search_title > a')
      .attr('href');
    novelUrl = novelUrl.split('/');
    novelUrl = novelUrl[4] + '-' + novelUrl[5];

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

const parseNovelAndChapters = async (novelUrl: string) => {
  const url = baseUrl + 'read/' + novelUrl;

  const body = await fetchHtml({ url, sourceId });

  let loadedCheerio = cheerio.load(body);

  let novel: SourceNovel = {
    sourceId: sourceId,
    sourceName: sourceName,
    url: url,
    novelUrl: novelUrl,
  };

  novel.novelName = loadedCheerio('div.fic_title').text();

  novel.novelCover = loadedCheerio('div.fic_image > img').attr('src');

  novel.summary = loadedCheerio('div.wi_fic_desc').text();

  novel.genre = '';
  loadedCheerio('span.wi_fic_genre')
    .find('span')
    .each(function () {
      novel.genre += loadedCheerio(this).text() + ',';
    });
  if (novel.genre) {
    novel.genre = novel.genre.slice(0, -1);
  }

  novel.status = loadedCheerio('span.rnd_stats')
    .next()
    .text()
    .includes('Ongoing')
    ? 'Ongoing'
    : 'Completed';

  novel.author = loadedCheerio('span.auth_name_fic').text();

  let formData = new FormData();
  formData.append('action', 'wi_getreleases_pagination');
  formData.append('pagenum', '-1');
  formData.append('mypostid', novelUrl.split('-')[0]);

  const data = await fetchApi({
    url: 'https://www.scribblehub.com/wp-admin/admin-ajax.php',
    init: {
      method: 'POST',
      body: formData,
    },
    sourceId,
  });
  const text = await data.text();

  loadedCheerio = cheerio.load(text);

  let novelChapters: SourceChapterItem[] = [];

  loadedCheerio('.toc_w').each(function () {
    const chapterName = loadedCheerio(this).find('.toc_a').text();
    const releaseDate = loadedCheerio(this).find('.fic_date_pub').text();

    const chapterUrl =
      loadedCheerio(this).find('a').attr('href')?.split('/')[6] || '';
    // .replace("/novel/" + novelUrl + "/", "");

    novelChapters.push({
      chapterName,
      releaseDate,
      chapterUrl,
    });
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl: string, chapterUrl: string) => {
  const url = `${baseUrl}read/${novelUrl}/chapter/${chapterUrl}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('div.chapter-title').text();

  let chapterText = loadedCheerio('div.chp_raw').html() || '';
  const chapter: SourceChapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async (searchTerm: string) => {
  const url =
    'https://www.scribblehub.com/?s=' + searchTerm + '&post_type=fictionposts';

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  const novels: SourceNovelItem[] = [];

  loadedCheerio('div.search_main_box').each(function () {
    const novelName = loadedCheerio(this).find('div.search_title > a').text();
    const novelCover = loadedCheerio(this)
      .find('div.search_img > img')
      .attr('src');

    let novelUrl: any = loadedCheerio(this)
      .find('div.search_title > a')
      .attr('href');
    let novelUrlSplit = novelUrl.split('/');
    novelUrl = novelUrlSplit[4] + '-' + novelUrlSplit[5];

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });
  return novels;
};

export const filters: SourceFilter[] = [
  {
    inputType: FilterInputs.Checkbox,
    key: 'genreInclude',
    label: 'Genre Include',
    values: [
      { label: 'Action', value: '9' },
      { label: 'Adult', value: '902' },
      { label: 'Adventure', value: '8' },
      { label: 'Boys Love', value: '891' },
      { label: 'Comedy', value: '7' },
      { label: 'Drama', value: '903' },
      { label: 'Ecchi', value: '904' },
      { label: 'Fanfiction', value: '38' },
      { label: 'Fantasy', value: '19' },
      { label: 'Gender Bender', value: '905' },
      { label: 'Girls Love', value: '892' },
      { label: 'Harem', value: '1015' },
      { label: 'Historical', value: '21' },
      { label: 'Horror', value: '22' },
      { label: 'Isekai', value: '37' },
      { label: 'Josei', value: '906' },
      { label: 'LitRPG', value: '1180' },
      { label: 'Martial Arts', value: '907' },
      { label: 'Mature', value: '20' },
      { label: 'Mecha', value: '908' },
      { label: 'Mystery', value: '909' },
      { label: 'Psychological', value: '910' },
      { label: 'Romance', value: '6' },
      { label: 'School Life', value: '911' },
      { label: 'Sci-fi', value: '912' },
      { label: 'Seinen', value: '913' },
      { label: 'Slice of Life', value: '914' },
      { label: 'Smut', value: '915' },
      { label: 'Sports', value: '916' },
      { label: 'Supernatural', value: '5' },
      { label: 'Tragedy', value: '901' },
    ],
  },
  {
    inputType: FilterInputs.Checkbox,
    key: 'genreExclude',
    label: 'Genre Exclude',
    values: [
      { label: 'Action', value: '9' },
      { label: 'Adult', value: '902' },
      { label: 'Adventure', value: '8' },
      { label: 'Boys Love', value: '891' },
      { label: 'Comedy', value: '7' },
      { label: 'Drama', value: '903' },
      { label: 'Ecchi', value: '904' },
      { label: 'Fanfiction', value: '38' },
      { label: 'Fantasy', value: '19' },
      { label: 'Gender Bender', value: '905' },
      { label: 'Girls Love', value: '892' },
      { label: 'Harem', value: '1015' },
      { label: 'Historical', value: '21' },
      { label: 'Horror', value: '22' },
      { label: 'Isekai', value: '37' },
      { label: 'Josei', value: '906' },
      { label: 'LitRPG', value: '1180' },
      { label: 'Martial Arts', value: '907' },
      { label: 'Mature', value: '20' },
      { label: 'Mecha', value: '908' },
      { label: 'Mystery', value: '909' },
      { label: 'Psychological', value: '910' },
      { label: 'Romance', value: '6' },
      { label: 'School Life', value: '911' },
      { label: 'Sci-fi', value: '912' },
      { label: 'Seinen', value: '913' },
      { label: 'Slice of Life', value: '914' },
      { label: 'Smut', value: '915' },
      { label: 'Sports', value: '916' },
      { label: 'Supernatural', value: '5' },
      { label: 'Tragedy', value: '901' },
    ],
  },
  {
    inputType: FilterInputs.Picker,
    key: 'andOr',
    label: 'Genre And/Or',
    values: [
      { label: 'OR', value: 'or' },
      { label: 'AND', value: 'and' },
    ],
  },
  {
    inputType: FilterInputs.Picker,
    key: 'sort',
    label: 'Sort By',
    values: [
      { label: 'Popularity', value: '1' },
      { label: 'Favorites', value: '2' },
      { label: 'Activity', value: '3' },
      { label: 'Readers', value: '4' },
      { label: 'Rising', value: '5' },
    ],
  },
  {
    inputType: FilterInputs.Picker,
    key: 'order',
    label: 'Order',
    values: [
      { label: 'All Time', value: '4' },
      { label: 'Daily', value: '1' },
      { label: 'Weekly', value: '2' },
      { label: 'Monthly', value: '3' },
    ],
  },
];

const ScribbleHubScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default ScribbleHubScraper;
