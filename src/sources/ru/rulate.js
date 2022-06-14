import { FilterInputs } from '../types/filterTypes';
import { Status } from '../helpers/constants';
import * as cheerio from 'cheerio';
import { defaultTo } from 'lodash';

const sourceId = 118;
const sourceName = 'Rulate';

const baseUrl = 'https://tl.rulate.ru';

const popularNovels = async (page, { showLatestNovels, filters }) => {
  let url = baseUrl + '/search?t=&cat=2';
  url += '&sort=' + defaultTo(filters?.sort, showLatestNovels ? '4' : '6');
  url += '&type=' + defaultTo(filters?.type, '0');
  url += '&atmosphere=' + defaultTo(filters?.atmosphere, '0');
  url += '&adult=' + defaultTo(filters?.adult, '0');

  if (filters?.genres?.length) {
    url += filters.genres.map(i => `&genres[]=${i}`).join('');
  }

  if (filters?.trash?.length) {
    url += filters.trash.map(i => `&${i}=1`);
  }
  url += `&Book_page=${page}`;

  const result = await fetch(url);
  const body = await result.text();
  const loadedCheerio = cheerio.load(body);
  const totalPages = parseInt(
    loadedCheerio('div[class="pagination"] > ul > li:last-child > a')
      .attr('href')
      .split('/Book_page/')[1] || '250',
    10,
  );
  let novels = [];

  loadedCheerio(
    'ul[class="search-results"] > li:not([class="ad_type_catalog"])',
  ).each(function () {
    const novelName = loadedCheerio(this).find('p > a').text();
    const novelCover = baseUrl + loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this).find('p > a').attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };
    novels.push(novel);
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  let result = await fetch(baseUrl + novelUrl);
  if (result.url.includes('mature?path=')) {
    const formData = new FormData();
    formData.append('path', novelUrl);
    formData.append('ok', 'Да');

    await fetch(result.url, {
      method: 'POST',
      body: formData,
    });

    result = await fetch(baseUrl + novelUrl);
  }
  const body = await result.text();
  const loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url: baseUrl + novelUrl,
    novelUrl,
  };

  novel.novelName = loadedCheerio('div[class="container"] > div > div > h1')
    .text()
    .trim();
  novel.novelCover =
    baseUrl + loadedCheerio('div[class="images"] > div img').attr('src');
  novel.summary = loadedCheerio('#Info > div:nth-child(3)').text().trim();
  novel.genre = [];

  let chapters = [];

  loadedCheerio('div[class="span5"] > p').each(function () {
    switch (loadedCheerio(this).find('strong').text()) {
      case 'Автор:':
        novel.author = loadedCheerio(this).find('em > a').text().trim();
        break;
      case 'Выпуск:':
        novel.status =
          loadedCheerio(this).find('em').text().trim() === 'продолжается'
            ? Status.ONGOING
            : Status.COMPLETED;
        break;
      case 'Тэги:':
        loadedCheerio(this)
          .find('em > a')
          .each(function () {
            novel.genre.push(loadedCheerio(this).text());
          });
        break;
      case 'Жанры:':
        loadedCheerio(this)
          .find('em > a')
          .each(function () {
            novel.genre.push(loadedCheerio(this).text());
          });
        break;
    }
  });

  if (novel.genre.length > 0) {
    novel.genre = novel.genre.reverse().join(',');
  } else {
    novel.genre = '';
  }

  loadedCheerio('table > tbody > tr.chapter_row').each(function () {
    const chapterName = loadedCheerio(this)
      .find('td[class="t"] > a')
      .text()
      .trim();
    const releaseDate = null;
    const chapterUrl = loadedCheerio(this)
      .find('td[class="t"] > a')
      .attr('href');

    if (loadedCheerio(this).find('td > span[class="disabled"]').length < 1) {
      chapters.push({ chapterName, releaseDate, chapterUrl });
    }
  });

  novel.chapters = chapters;
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  let result = await fetch(baseUrl + chapterUrl);
  if (result.url.includes('mature?path=')) {
    const formData = new FormData();
    formData.append('path', novelUrl);
    formData.append('ok', 'Да');

    await fetch(result.url, {
      method: 'POST',
      body: formData,
    });

    result = await fetch(baseUrl + chapterUrl);
  }
  const body = await result.text();
  const loadedCheerio = cheerio.load(body);

  loadedCheerio('.content-text img').each(function () {
    if (!loadedCheerio(this).attr('src')?.startsWith('http')) {
      const src = loadedCheerio(this).attr('src');
      loadedCheerio(this).attr('src', baseUrl + src);
    }
  });

  const chapterName = loadedCheerio(
    '.chapter_select > select > option[selected]',
  )
    .text()
    .trim();
  const chapterText = loadedCheerio('.content-text').html();

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
  const result = await fetch(
    baseUrl + '/search/autocomplete?query=' + searchTerm,
  );
  let json = await result.json();
  let novels = [];

  json.map(item => {
    const novelName = item.title_one + ' / ' + item.title_two;
    const novelCover = baseUrl + item.img;
    const novelUrl = item.url;

    novels.push({ sourceId, novelName, novelCover, novelUrl });
  });

  return novels;
};

const filters = [
  {
    key: 'sort',
    label: 'Сортировка',
    values: [
      { label: 'По рейтингу', value: '6' },
      { label: 'По степени готовности', value: '0' },
      { label: 'По названию на языке оригинала', value: '1' },
      { label: 'По названию на языке перевода', value: '2' },
      { label: 'По дате создания', value: '3' },
      { label: 'По дате последней активности', value: '4' },
      { label: 'По просмотрам', value: '5' },
      { label: 'По кол-ву переведённых глав', value: '7' },
      { label: 'По кол-ву лайков', value: '8' },
      { label: 'По кол-ву страниц', value: '10' },
      { label: 'По кол-ву бесплатных глав', value: '11' },
      { label: 'По кол-ву рецензий', value: '12' },
      { label: 'По кол-ву в закладках', value: '13' },
      { label: 'По кол-ву в избранном', value: '14' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'type',
    label: 'Тип',
    values: [
      { label: 'Неважно', value: '0' },
      { label: 'Только переводы', value: '1' },
      { label: 'Только авторские', value: '2' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'genres',
    label: 'Жанры',
    values: [
      { label: 'арт', value: '1' },
      { label: 'боевик', value: '2' },
      { label: 'боевые искусства', value: '3' },
      { label: 'вампиры', value: '4' },
      { label: 'гарем', value: '5' },
      { label: 'гендерная интрига', value: '6' },
      { label: 'героическое фэнтези', value: '7' },
      { label: 'детектив', value: '8' },
      { label: 'дзёсэй', value: '9' },
      { label: 'додзинси', value: '10' },
      { label: 'драма', value: '11' },
      { label: 'игра', value: '12' },
      { label: 'история', value: '13' },
      { label: 'киберпанк', value: '46' },
      { label: 'кодомо', value: '14' },
      { label: 'комедия', value: '15' },
      { label: 'литрпг', value: '48' },
      { label: 'махо-сёдзё', value: '16' },
      { label: 'мелодрама', value: '49' },
      { label: 'меха', value: '17' },
      { label: 'мистика', value: '18' },
      { label: 'научная фантастика', value: '19' },
      { label: 'повседневность', value: '20' },
      { label: 'постапокалиптика', value: '21' },
      { label: 'приключения', value: '22' },
      { label: 'психология', value: '23' },
      { label: 'романтика', value: '24' },
      { label: 'самурайский боевик', value: '25' },
      { label: 'сверхъестественное', value: '26' },
      { label: 'сёдзё', value: '27' },
      { label: 'сёдзё-ай', value: '28' },
      { label: 'сёнэн', value: '29' },
      { label: 'сёнэн-ай', value: '30' },
      { label: 'смат', value: '45' },
      { label: 'спорт', value: '31' },
      { label: 'сэйнэн', value: '32' },
      { label: 'сюаньхуа', value: '44' },
      { label: 'сюаньхуань', value: '47' },
      { label: 'сянься (XianXia)', value: '42' },
      { label: 'трагедия', value: '33' },
      { label: 'триллер', value: '34' },
      { label: 'ужасы', value: '35' },
      { label: 'уся (wuxia)', value: '41' },
      { label: 'фантастика', value: '36' },
      { label: 'фанфик', value: '50' },
      { label: 'фэнтези', value: '37' },
      { label: 'школа', value: '38' },
      { label: 'этти', value: '39' },
      { label: 'юри', value: '40' },
      { label: 'яой', value: '43' },
    ],
    inputType: FilterInputs.Checkbox,
  },
  {
    key: 'atmosphere',
    label: 'Атмосфера',
    values: [
      { label: 'Неважно', value: '0' },
      { label: 'Позитивная', value: '1' },
      { label: 'Dark', value: '2' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'trash',
    label: 'Другое',
    values: [
      { label: 'Готовые на 100%', value: 'ready' },
      { label: 'Доступные для скачивания', value: 'gen' },
      { label: 'Доступные для перевода', value: 'tr' },
      { label: 'Завершённые проекты', value: 'wealth' },
      { label: 'Распродажа', value: 'discount' },
      { label: 'Только онгоинги', value: 'ongoings' },
      { label: 'Убрать машинный', value: 'remove_machinelate' },
    ],
    inputType: FilterInputs.Checkbox,
  },
  {
    key: 'adult',
    label: 'Возрастные ограничения',
    values: [
      { label: 'Все', value: '0' },
      { label: 'Убрать 18+', value: '1' },
      { label: 'Только 18+', value: '2' },
    ],
    inputType: FilterInputs.Picker,
  },
];

const RulateLibScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default RulateLibScraper;
