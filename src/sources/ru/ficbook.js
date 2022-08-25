import { Status, defaultCoverUri } from '../helpers/constants';
import { FilterInputs } from '../types/filterTypes';
import * as cheerio from 'cheerio';
import { defaultTo } from 'lodash';

const sourceId = 139;
const sourceName = 'Книга Фанфиков';

const baseUrl = 'https://ficbook.net';

const popularNovels = async (page, { filters }) => {
  let url = baseUrl;

  if (filters?.directions) {
    url += '/popular/' + filters.directions;
  } else {
    url += `/${defaultTo(filters?.sort, 'fanfiction')}?p=${page}`;
  }

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);
  const totalPages = parseInt(
    loadedCheerio(
      'nav.pagenav:nth-child(1) > div:nth-child(2) > b:nth-child(2)',
    ).text() || '1',
    10,
  );
  let novels = [];

  loadedCheerio('article.fanfic-inline').each(function () {
    const novelName = loadedCheerio(this).find('h3 > a').text();
    let novelCover =
      loadedCheerio(this).find('picture > img').attr('src') || defaultCoverUri;
    let novelUrl = loadedCheerio(this).find('h3 > a').attr('href');

    novelUrl = novelUrl.replace(/\?.*/g, '');
    novelCover = novelCover.replace(/covers\/m_|covers\/d_/g, 'covers/');

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

const parseNovelAndChapters = async novelUrl => {
  const result = await fetch(baseUrl + novelUrl);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    novelUrl,
    url: baseUrl + novelUrl,
  };

  novel.novelName = loadedCheerio('h1[itemprop="headline"]').text().trim();

  novel.novelCover = loadedCheerio('meta[property="og:image"]')
    .attr('content')
    ?.replace(/covers\/m_|covers\/d_/g, 'covers/');

  novel.summary = loadedCheerio('div[itemprop="description"]').text().trim();

  novel.author = loadedCheerio('a[itemprop="author"]').text();

  novel.status =
    loadedCheerio(
      'div.fanfic-main-info > section:nth-child(3) > div:nth-child(3) > span:nth-child(2)',
    ).text() === 'В процессе'
      ? Status.ONGOING
      : Status.COMPLETED;

  let tags = [];

  loadedCheerio('div[class="tags"] > a').each(function () {
    tags.push(loadedCheerio(this).text());
  });

  if (tags) {
    novel.genre = tags.join(',');
  }

  if (!novel.novelCover || novel.novelCover?.includes('/design/')) {
    novel.novelCover = defaultCoverUri;
  }

  let chapters = [];

  if (loadedCheerio('#content').length == 1) {
    const chapterName = loadedCheerio('.title-area > h2').text();
    const releaseDate = loadedCheerio('.part-date > span').attr('title');
    const chapterUrl = novelUrl;

    chapters.push({ chapterName, releaseDate, chapterUrl });
  } else {
    loadedCheerio('li.part').each(function () {
      const chapterName = loadedCheerio(this).find('h3').text();
      const releaseDate = loadedCheerio(this).find('div > span').attr('title');
      const chapterUrl = loadedCheerio(this)
        .find('a:nth-child(1)')
        .attr('href');

      chapters.push({ chapterName, releaseDate, chapterUrl });
    });
    chapters = chapters.reverse();
  }
  novel.chapters = chapters;
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(baseUrl + chapterUrl);
  const body = await result.text();
  const loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('.title-area > h2').text();
  let chapterText = loadedCheerio('#content').html();

  if (!chapterText) {
    chapterText = 'Chapter is empty.';
  }

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
  let url = `${baseUrl}/search/fanfic`;

  const formData = new FormData();
  formData.append('term', searchTerm);
  formData.append('page', '1');

  const result = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  let json = await result.json();
  let novels = [];

  json.data.data.map(item => {
    const novelName = item.title;
    const novelUrl = '/readfic/' + item.id;
    let novelCover = defaultCoverUri;
    if (item.cover) {
      novelCover = 'https://images.ficbook.net/fanfic-covers/' + item.cover;
    }

    novels.push({ sourceId, novelName, novelCover, novelUrl });
  });

  return novels;
};

const filters = [
  {
    key: 'sort',
    label: 'Сортировка',
    values: [
      { label: 'Горячие работы', value: 'fanfiction' },
      { label: 'Популярные ', value: 'popular' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'directions',
    label: 'Направление',
    values: [
      { label: 'Гет', value: 'het' },
      { label: 'Джен', value: 'gen' },
      { label: 'Другие виды отношений', value: 'other' },
      { label: 'Слэш', value: 'slash-fanfics' },
      { label: 'Смешанная', value: 'mixed' },
      { label: 'Статья', value: 'article' },
      { label: 'Фемслэш', value: 'femslash-fanfics' },
    ],
    inputType: FilterInputs.Picker,
  },
];

const FicbookScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default FicbookScraper;
