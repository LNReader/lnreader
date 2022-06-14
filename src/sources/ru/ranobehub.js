import * as cheerio from 'cheerio';
import { defaultTo } from 'lodash';
import { Status } from '../helpers/constants';
import { htmlToText } from '../helpers/htmlToText';
import { FilterInputs } from '../types/filterTypes';
const sourceId = 69;

const sourceName = 'RanobeHub';

const baseUrl = 'https://ranobehub.org/';

const popularNovels = async (page, { showLatestNovels, filters }) => {
  let url = baseUrl + `api/search?page=${page}&sort=`;
  url += defaultTo(
    filters?.sort,
    showLatestNovels ? 'last_chapter_at' : 'computed_rating',
  );
  url += '&status=' + defaultTo(filters?.status, '0');

  if (filters?.country?.length) {
    url += '&country=' + filters?.country.join(',');
  }

  if (filters?.tags?.length) {
    url += '&tags:positive=' + filters?.tags.join(',');
  }
  url += '&take=40';

  const result = await fetch(url);
  const body = await result.json();

  let novels = [];

  body.resource.forEach(novel => {
    const novelName = novel.names.rus;
    const novelCover = novel.poster.medium;
    const novelUrl = novel.url.split('/').pop();

    novels.push({
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    });
  });

  const totalPages = body.pagination?.lastPage || 1;

  return { novels, totalPages };
};

const parseNovelAndChapters = async novelUrl => {
  const novelId = novelUrl.split('-')[0];
  const result = await fetch(`${baseUrl}api/ranobe/${novelId}`);
  const json = await result.json();

  let novel = {
    sourceId,
    sourceName,
    url: json.data.url,
    novelUrl,
    novelName: json.data.names.rus,
    novelCover: json.data.posters.medium,
    summary: htmlToText(json.data.description),
    //author: json.data?.authors[0]?.name_eng || '',
    status: json.data.status.title.includes('процессе')
      ? Status.ONGOING
      : Status.COMPLETED,
  };

  let tags = []
    .concat(json.data.tags.events, json.data.tags.genres)
    .map(item => item?.names?.rus)
    .filter(item => item);

  if (tags.length > 0) {
    novel.genre = tags.join(',');
  }

  let novelChapters = [];

  const fetchChaptersUrl = `${baseUrl}api/ranobe/${novelId}/contents`;

  const chaptersRaw = await fetch(fetchChaptersUrl);
  const chaptersJSON = await chaptersRaw.json();

  chaptersJSON.volumes.map(volume =>
    volume.chapters.map(chapter =>
      novelChapters.push({
        chapterName: chapter.name,
        chapterUrl: chapter.url,
        releaseDate: null,
      }),
    ),
  );

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;
  const chapterId = chapterUrl.split('/')[4];

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio(
    'body > div.pusher.container_main > div:nth-child(5) > div:nth-child(1) > div.title-wrapper > h1',
  ).text();

  loadedCheerio(
    'body > div.pusher.container_main > div:nth-child(5) > div:nth-child(1) img',
  ).each(function () {
    if (!loadedCheerio(this).attr('src')?.startsWith('http')) {
      const dataMediaId = loadedCheerio(this).attr('data-media-id');
      const newSrc = `${baseUrl}api/media/${dataMediaId}`;

      loadedCheerio(this).attr('src', newSrc);
    }
  });

  let chapterText = loadedCheerio(
    'body > div.pusher.container_main > div:nth-child(5) > div:nth-child(1)',
  ).html();

  // Remove script tags
  chapterText = chapterText?.replace(
    /<\s*script[^>]*>[\s\S]*?<\/script>/gim,
    '',
  );

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
  const url = `${baseUrl}api/fulltext/global?query=${searchTerm}&take=5`;

  const result = await fetch(url);
  const data = await result.json();

  let novels = [];

  data
    .find(item => item.meta.key === 'ranobe')
    ?.data.map(novel =>
      novels.push({
        sourceId,
        novelName: novel.names.rus,
        novelUrl: novel.url.match(
          /https:\/\/ranobehub\.org\/ranobe\/(.*?)\?utm_source=search_name&utm_medium=search&utm_campaign=search_using/,
        )[1],
        novelCover: novel.image,
      }),
    );

  return novels;
};

const filters = [
  {
    key: 'sort',
    label: 'Сортировка',
    values: [
      { label: 'по рейтингу', value: 'computed_rating' },
      { label: 'по дате обновления', value: 'last_chapter_at' },
      { label: 'по дате добавления', value: 'created_at' },
      { label: 'по названию', value: 'name_rus' },
      { label: 'по просмотрам', value: 'views' },
      { label: 'по количеству глав', value: 'count_chapters' },
      { label: 'по объему перевода', value: 'count_of_symbols' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'status',
    label: 'Статус перевода',
    values: [
      { label: 'Любой', value: '' },
      { label: 'В процессе', value: '1' },
      { label: 'Завершено', value: '2' },
      { label: 'Заморожено', value: '3' },
      { label: 'Неизвестно', value: '4' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'country',
    label: 'Тип',
    values: [
      { label: 'Япония', value: '1' },
      { label: 'Китай', value: '2' },
      { label: 'Корея', value: '3' },
      { label: 'США', value: '4' },
    ],
    inputType: FilterInputs.Checkbox,
  },
  {
    key: 'tags',
    label: 'Жанры',
    values: [
      { label: 'Ужасы', value: '1' },
      { label: 'Мистика', value: '2' },
      { label: 'Триллер', value: '3' },
      { label: 'Сэйнэн', value: '5' },
      { label: 'Драма', value: '7' },
      { label: 'Фэнтези', value: '8' },
      { label: 'Романтика', value: '9' },
      { label: 'Приключение', value: '11' },
      { label: 'Милитари', value: '12' },
      { label: 'Научная фантастика', value: '13' },
      { label: 'Экшн', value: '14' },
      { label: 'Сёдзё', value: '15' },
      { label: 'Комедия', value: '17' },
      { label: 'Психология', value: '18' },
      { label: 'Трагедия', value: '19' },
      { label: 'Сверхъестественное', value: '20' },
      { label: 'Школьная жизнь', value: '21' },
      { label: 'Боевые искусства', value: '22' },
      { label: 'Сёдзё-ай', value: '23' },
      { label: 'Меха', value: '24' },
      { label: 'Повседневность', value: '93' },
      { label: 'Исторический', value: '101' },
      { label: 'Гарем', value: '114' },
      { label: 'Для взрослых', value: '115' },
      { label: 'Сёнэн', value: '189' },
      { label: 'Дзёсэй', value: '216' },
      { label: 'Сюаньхуа', value: '242' },
      { label: 'Гендер бендер', value: '246' },
      { label: 'Для взрослых', value: '258' },
      { label: 'Эччи', value: '327' },
      { label: 'Сянься', value: '364' },
      { label: 'Спорт', value: '420' },
      { label: 'Лоликон', value: '638' },
      { label: 'Сёнэн-ай', value: '680' },
      { label: 'Яой', value: '682' },
      { label: 'Юри', value: '691' },
      { label: 'Уся', value: '720' },
      { label: 'Непристойность', value: '747' },
      { label: 'Магический реализм', value: '922' },
    ],
    inputType: FilterInputs.Checkbox,
  },
];

const RanobeHubScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default RanobeHubScraper;
