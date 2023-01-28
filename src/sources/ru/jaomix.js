import * as cheerio from 'cheerio';
import { defaultTo } from 'lodash';
import { Status } from '../helpers/constants';
import { FilterInputs } from '../types/filterTypes';

const sourceId = 117;
const sourceName = 'Jaomix';

const baseUrl = 'https://jaomix.ru';

const popularNovels = async (page, { showLatestNovels, filters }) => {
  let url = baseUrl + '/?search=&sortby=';
  url += defaultTo(filters?.sort, showLatestNovels ? 'upd' : 'count');

  if (filters?.type?.length) {
    url += filters.type.map(i => `&lang[]=${i}`).join('');
  }

  if (filters?.genres?.length) {
    url += filters.genres.map(i => `&genre[]=${i}`).join('');
  }
  url += `&page=${page}`;

  const result = await fetch(url);
  let body = await result.text();

  const loadedCheerio = cheerio.load(body);
  let novels = [];

  loadedCheerio('div[class="block-home"] > div[class="one"]').each(function () {
    const novelName = loadedCheerio(this)
      .find('div[class="img-home"] > a')
      .attr('title');
    const novelCover = loadedCheerio(this)
      .find('div[class="img-home"] > a > img')
      .attr('src')
      .replace('-150x150', '');
    const novelUrl = loadedCheerio(this)
      .find('div[class="img-home"] > a')
      .attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };
    novels.push(novel);
  });

  let totalPages =
    loadedCheerio('.pagi-home > span:nth-child(2) > a:last-child')
      .attr('href')
      ?.replace(/[^0-9]/g, '') || '1';

  totalPages = parseInt(totalPages, 10);

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const result = await fetch(novelUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);
  let novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
  };

  novel.novelName = loadedCheerio('div[class="desc-book"] > h1').text().trim();
  novel.novelCover = loadedCheerio('div[class="img-book"] > img').attr('src');
  novel.summary = loadedCheerio('div[id="desc-tab"]').text().trim();

  loadedCheerio('#info-book > p').each(function () {
    let text = loadedCheerio(this).text().replace(/,/g, '').split(' ');
    if (text[0] === 'Автор:') {
      novel.author = text.splice(1).join(' ');
    } else if (text[0] === 'Жанры:') {
      novel.genre = text.splice(1).join(',');
    } else if (text[0] === 'Статус:') {
      novel.status = text.includes('продолжается')
        ? Status.ONGOING
        : Status.COMPLETED;
    }
  });

  const chapters = [];

  loadedCheerio('.download-chapter div.title').each(function () {
    chapters.push({
      chapterName: loadedCheerio(this).find('a').attr('title'),
      releaseDate: loadedCheerio(this).find('time').text(),
      chapterUrl: loadedCheerio(this).find('a').attr('href'),
    });
  });

  novel.chapters = chapters.reverse();
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(chapterUrl);
  const body = await result.text();
  const loadedCheerio = cheerio.load(body);

  loadedCheerio('div[class="adblock-service"]').remove();
  const chapterName = loadedCheerio('h1[class="entry-title"]').text();
  const chapterText = loadedCheerio('div[class="entry-content"]').html();

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName: chapterName,
    chapterText: chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `${baseUrl}/?search=${searchTerm}&but=%D0%9F%D0%BE%D0%B8%D1%81%D0%BA+%D0%BF%D0%BE+%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8E&sortby=new`;
  const result = await fetch(url);
  let body = await result.text();
  const loadedCheerio = cheerio.load(body);

  let novels = [];
  loadedCheerio('div[class="block-home"] > div[class="one"]').each(function () {
    const novelName = loadedCheerio(this)
      .find('div[class="img-home"] > a')
      .attr('title');
    const novelCover = loadedCheerio(this)
      .find('div[class="img-home"] > a > img')
      .attr('src')
      .replace('-150x150', '');
    const novelUrl = loadedCheerio(this)
      .find('div[class="img-home"] > a')
      .attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };
    novels.push(novel);
  });

  return novels;
};

const filters = [
  {
    key: 'sort',
    label: 'Сортировка',
    values: [
      { label: 'Имя', value: 'alphabet' },
      { label: 'Просмотры', value: 'count' },
      { label: 'Дате добавления', value: 'new' },
      { label: 'Дате обновления', value: 'upd' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'type',
    label: 'Тип',
    values: [
      { label: 'Английский', value: 'Английский' },
      { label: 'Китайский', value: 'Китайский' },
      { label: 'Корейский', value: 'Корейский' },
      { label: 'Японский', value: 'Японский' },
    ],
    inputType: FilterInputs.Checkbox,
  },
  {
    key: 'genres',
    label: 'Жанры',
    values: [
      { label: 'Adult', value: 'Adult' },
      { label: 'Ecchi', value: 'Ecchi' },
      { label: 'Josei', value: 'Josei' },
      { label: 'Lolicon', value: 'Lolicon' },
      { label: 'Mature', value: 'Mature' },
      { label: 'Sci-fi', value: 'Sci-fi' },
      { label: 'Shoujo', value: 'Shoujo' },
      { label: 'Wuxia', value: 'Wuxia' },
      { label: 'Xianxia', value: 'Xianxia' },
      { label: 'Xuanhuan', value: 'Xuanhuan' },
      { label: 'Yaoi', value: 'Yaoi' },
      { label: 'Боевые Искусства', value: 'Боевые Искусства' },
      { label: 'Виртуальный Мир', value: 'Виртуальный Мир' },
      { label: 'Гарем', value: 'Гарем' },
      { label: 'Детектив', value: 'Детектив' },
      { label: 'Драма', value: 'Драма' },
      { label: 'Игра', value: 'Игра' },
      { label: 'Истории из жизни', value: 'Истории из жизни' },
      { label: 'Исторический', value: 'Исторический' },
      { label: 'История', value: 'История' },
      { label: 'Комедия', value: 'Комедия' },
      { label: 'Меха', value: 'Меха' },
      { label: 'Мистика', value: 'Мистика' },
      { label: 'Научная Фантастика', value: 'Научная Фантастика' },
      { label: 'Повседневность', value: 'Повседневность' },
      { label: 'Постапокалипсис', value: 'Постапокалипсис' },
      { label: 'Приключения', value: 'Приключения' },
      { label: 'Психология', value: 'Психология' },
      { label: 'Романтика', value: 'Романтика' },
      { label: 'Сёнэн', value: 'Сёнэн' },
      { label: 'Сёнэн-ай', value: 'Сёнэн-ай' },
      { label: 'Сверхъестественное', value: 'Сверхъестественное' },
      { label: 'Спорт', value: 'Спорт' },
      { label: 'Сэйнэн', value: 'Сэйнэн' },
      { label: 'Сюаньхуа', value: 'Сюаньхуа' },
      { label: 'Трагедия', value: 'Трагедия' },
      { label: 'Триллер', value: 'Триллер' },
      { label: 'Фантастика', value: 'Фантастика' },
      { label: 'Фэнтези', value: 'Фэнтези' },
      { label: 'Хоррор', value: 'Хоррор' },
      { label: 'Школьная жизнь', value: 'Школьная жизнь' },
      { label: 'Шоунен', value: 'Шоунен' },
      { label: 'Экшн', value: 'Экшн' },
      { label: 'Этти', value: 'Этти' },
    ],
    inputType: FilterInputs.Checkbox,
  },
];

const JaomixScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default JaomixScraper;
