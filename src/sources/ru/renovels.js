import { FilterInputs } from '../types/filterTypes';
import { htmlToText } from '../helpers/htmlToText';
import { Status } from '../helpers/constants';
import { defaultTo } from 'lodash';

const sourceId = 116;
const sourceName = 'Renovels';

const baseUrl = 'https://renovels.org';

const popularNovels = async (page, { showLatestNovels, filters }) => {
  let url = baseUrl + '/api/search/catalog/?count=30&ordering=';
  url += filters?.order ? filters?.order?.replace('+', '') : '-';
  url += defaultTo(filters?.sort, showLatestNovels ? 'chapter_date' : 'rating');

  if (filters?.type?.length) {
    url += filters.type.map(i => `&types=${i}`).join('');
  }

  if (filters?.statuss?.length) {
    url += filters?.statuss.map(i => `&status=${i}`).join('');
  }

  if (filters?.genres?.length) {
    url += filters.genres.map(i => `&genres=${i}`).join('');
  }
  url += '&page=' + page;

  const result = await fetch(url);
  let body = await result.json();

  let novels = [];

  body.content.map(item => {
    const novelName = item.rus_name;
    const novelCover = baseUrl + (item.img?.high || item.img.low);
    const novelUrl = item.dir;
    novels.push({ sourceId, novelName, novelCover, novelUrl });
  });

  let totalPages = body.props.total_pages;
  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const result = await fetch(baseUrl + '/api/titles/' + novelUrl);
  let body = await result.json();

  let novel = {
    sourceId,
    sourceName,
    novelUrl,
    url: baseUrl + '/novel/' + body.content.dir,
    novelName: body.content.rus_name,
    novelCover: baseUrl + (body.content.img?.high || body.content.img.low),
    summary: htmlToText(body.content.description),
    status:
      body.content.status.name === 'Продолжается'
        ? Status.ONGOING
        : Status.COMPLETED,
  };

  let tags = []
    .concat(body.content.genres, body.content.categories, [])
    .map(item => item.name);

  if (tags.length > 0) {
    novel.genre = tags.join(',');
  }

  let all = (body.content.count_chapters / 100 + 1) ^ 0;
  let chapters = [];

  for (let i = 0; i < all; i++) {
    let chapterResult = await fetch(
      baseUrl +
        '/api/titles/chapters/?branch_id=' +
        body.content.branches[0].id +
        '&count=100&page=' +
        (i + 1),
    );
    let volumes = await chapterResult.json();

    volumes.content.map(item => {
      const chapterName =
        `Том ${item.tome} Глава ${item.chapter} ${item.name}`?.trim();
      const releaseDate = item.upload_date;
      const chapterUrl = baseUrl + '/api/titles/chapters/' + item.id + '/';

      if (!item.is_paid || item.is_bought) {
        chapters.push({ chapterName, releaseDate, chapterUrl });
      }
    });
  }

  novel.chapters = chapters.reverse();
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(chapterUrl);
  const body = await result.json();

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName: body.content.name || body.content.chapter,
    chapterText: body.content.content,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `${baseUrl}/api/search/?query=${searchTerm}&count=100&field=titles`;
  const result = await fetch(url);
  let body = await result.json();
  let novels = [];

  body.content.map(item => {
    const novelName = item.rus_name;
    const novelCover = baseUrl + (item.img?.high || item.img.low);
    const novelUrl = item.dir;
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
      { label: 'Рейтинг', value: 'rating' },
      { label: 'Просмотры', value: 'views' },
      { label: 'Лайкам', value: 'votes' },
      { label: 'Дате добавления', value: 'id' },
      { label: 'Дате обновления', value: 'chapter_date' },
      { label: 'Количество глав', value: 'count_chapters' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'order',
    label: 'Порядок',
    values: [
      { label: 'По убыванию', value: '-' }, // desc
      { label: 'По возрастанию', value: '+' }, // asc
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'type',
    label: 'Тип',
    values: [
      { label: 'Авторское', value: '1' },
      { label: 'Япония', value: '2' },
      { label: 'Корея', value: '3' },
      { label: 'Китай', value: '4' },
      { label: 'Запад', value: '5' },
      { label: 'Фанфики', value: '6' },
      { label: 'Другое', value: '7' },
    ],
    inputType: FilterInputs.Checkbox,
  },
  {
    key: 'statuss',
    label: 'Статус тайтла',
    values: [
      { label: 'Закончен', value: '0' },
      { label: 'Продолжается', value: '1' },
      { label: 'Заморожен', value: '2' },
      { label: 'Нет переводчика', value: '3' },
      { label: 'Анонс', value: '4' },
      { label: 'Лицензировано', value: '5' },
    ],
    inputType: FilterInputs.Checkbox,
  },
  {
    key: 'genres',
    label: 'Жанры',
    values: [
      { label: 'Боевик', value: '112' },
      { label: 'Война', value: '123' },
      { label: 'Детектив', value: '114' },
      { label: 'Драма', value: '125' },
      { label: 'Историческая проза', value: '115' },
      { label: 'ЛитРПГ', value: '109' },
      { label: 'Любовные романы', value: '116' },
      { label: 'Мистика', value: '103' },
      { label: 'Научная фантастика', value: '121' },
      { label: 'Повседневность', value: '128' },
      { label: 'Подростковая проза', value: '113' },
      { label: 'Политический роман', value: '119' },
      { label: 'Попаданцы', value: '108' },
      { label: 'Поэзия', value: '105' },
      { label: 'Разное', value: '111' },
      { label: 'РеалРПГ', value: '117' },
      { label: 'Романтика', value: '126' },
      { label: 'Современная проза', value: '102' },
      { label: 'Современная фантастика', value: '127' },
      { label: 'Спорт', value: '122' },
      { label: 'Трагедия', value: '129' },
      { label: 'Триллер', value: '110' },
      { label: 'Триллер и саспенс', value: '124' },
      { label: 'Ужасы', value: '106' },
      { label: 'Фантастика', value: '101' },
      { label: 'Фанфик', value: '107' },
      { label: 'Фьюжн роман', value: '120' },
      { label: 'Фэнтези', value: '100' },
      { label: 'Эротика', value: '118' },
      { label: 'Юмор', value: '104' },
    ],
    inputType: FilterInputs.Checkbox,
  },
];

const RenovelsScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default RenovelsScraper;
