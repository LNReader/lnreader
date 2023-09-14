import dayjs from 'dayjs';
import * as cheerio from 'cheerio';
import { Status } from '../helpers/constants';
import { FilterInputs } from '../types/filterTypes';

const sourceId = 164;
const sourceName = 'BookRiver';
const baseUrl = 'https://bookriver.ru';

const popularNovels = async (page, { showLatestNovels, filters }) => {
  let url = baseUrl + `/genre?page=${page}&perPage=24&sortingType=`;
  url += showLatestNovels ? 'last-update' : filters?.sort || 'bestseller';

  if (filters?.genres?.length) {
    url += '&g=' + filters.genres.join(',');
  }

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);
  let json = loadedCheerio('#__NEXT_DATA__').html();
  json = JSON.parse(json);

  let novels = [];
  json.props.pageProps.state.pagesFilter.genre.books.forEach(novel =>
    novels.push({
      sourceId,
      novelName: novel.name,
      novelCover: novel.coverImages[0].url,
      novelUrl: baseUrl + '/book/' + novel.slug,
    }),
  );

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const result = await fetch(novelUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);
  const json = loadedCheerio('#__NEXT_DATA__').html();
  const book = JSON.parse(json).props.pageProps.state.book.bookPage;

  let novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
    novelName: book.name,
    novelCover: book.coverImages[0].url,
    summary: book.annotation,
    author: book.author.name,
    genre: book.tags.map(item => item.name).join(','),
    status:
      book.statusComplete === 'writing' ? Status.ONGOING : Status.COMPLETED,
  };

  let chapters = [];

  book.ebook.chapters.forEach(chapter => {
    if (chapter.available) {
      chapters.push({
        chapterName: chapter.name,
        releaseDate: dayjs(
          chapter?.firstPublishedAt || chapter.createdAt,
        ).format('LLL'),
        chapterUrl: baseUrl + '/reader/' + book.slug + '/' + chapter.chapterId,
      });
    }
  });

  novel.chapters = chapters;
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = 'https://api.bookriver.ru/api/v1/books/chapter/text/';
  const result = await fetch(url + chapterUrl.split('/').pop());
  const json = await result.json();

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName: json.data.name,
    chapterText: json.data.content,
  };
  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `https://api.bookriver.ru/api/v1/search/autocomplete?keyword=${searchTerm}&page=1&perPage=10`;
  const result = await fetch(url);
  const json = await result.json();

  let novels = [];
  json?.data?.books?.forEach(novel =>
    novels.push({
      sourceId,
      novelName: novel.name,
      novelCover: novel.coverImages[0].url,
      novelUrl: baseUrl + '/book/' + novel.slug,
    }),
  );

  return novels;
};

const filters = [
  {
    key: 'sort',
    label: 'Сортировка',
    values: [
      { label: 'Бестселлеры', value: 'bestseller' },
      { label: 'Дате добавления', value: 'newest' },
      { label: 'Дате обновления', value: 'last-update' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'genres',
    label: 'жанры',
    values: [
      { label: 'Альтернативная история', value: 'alternativnaya-istoriya' },
      { label: 'Боевая фантастика', value: 'boevaya-fantastika' },
      { label: 'Боевое фэнтези', value: 'boevoe-fentezi' },
      { label: 'Бытовое фэнтези', value: 'bytovoe-fentezi' },
      { label: 'Героическая фантастика', value: 'geroicheskaya-fantastika' },
      { label: 'Героическое фэнтези', value: 'geroicheskoe-fentezi' },
      { label: 'Городское фэнтези', value: 'gorodskoe-fentezi' },
      { label: 'Детектив', value: 'detektiv' },
      { label: 'Детективная фантастика', value: 'detektivnaya-fantastika' },
      { label: 'Жёсткая эротика', value: 'zhyostkaya-erotika' },
      { label: 'Исторический детектив', value: 'istoricheskii-detektiv' },
      {
        label: 'Исторический любовный роман',
        value: 'istoricheskii-lyubovnyi-roman',
      },
      { label: 'Историческое фэнтези', value: 'istoricheskoe-fentezi' },
      { label: 'Киберпанк', value: 'kiberpank' },
      { label: 'Классический детектив', value: 'klassicheskii-detektiv' },
      { label: 'Короткий любовный роман', value: 'korotkii-lyubovnyi-roman' },
      { label: 'Космическая фантастика', value: 'kosmicheskaya-fantastika' },
      { label: 'Криминальный детектив', value: 'kriminalnyi-detektiv' },
      { label: 'ЛитРПГ', value: 'litrpg' },
      { label: 'Любовная фантастика', value: 'lyubovnaya-fantastika' },
      { label: 'Любовное фэнтези', value: 'lyubovnoe-fentezi' },
      { label: 'Любовный роман', value: 'lyubovnyi-roman' },
      { label: 'Мистика', value: 'mistika' },
      { label: 'Молодежная проза', value: 'molodezhnaya-proza' },
      { label: 'Научная фантастика', value: 'nauchnaya-fantastika' },
      {
        label: 'Остросюжетный любовный роман',
        value: 'ostrosyuzhetnyi-lyubovnyi-roman',
      },
      { label: 'Политический детектив', value: 'politicheskii-detektiv' },
      { label: 'Попаданцы', value: 'popadantsy' },
      { label: 'Постапокалипсис', value: 'postapokalipsis' },
      { label: 'Приключенческое фэнтези', value: 'priklyuchencheskoe-fentezi' },
      { label: 'Романтическая эротика', value: 'romanticheskaya-erotika' },
      { label: 'С элементами эротики', value: 's-elementami-erotiki' },
      { label: 'Славянское фэнтези', value: 'slavyanskoe-fentezi' },
      {
        label: 'Современный любовный роман',
        value: 'sovremennyi-lyubovnyi-roman',
      },
      { label: 'Социальная фантастика', value: 'sotsialnaya-fantastika' },
      { label: 'Тёмное фэнтези', value: 'temnoe-fentezi' },
      { label: 'Фантастика', value: 'fantastika' },
      { label: 'Фэнтези', value: 'fentezi' },
      { label: 'Шпионский детектив', value: 'shpionskii-detektiv' },
      { label: 'Эпическое фэнтези', value: 'epicheskoe-fentezi' },
      { label: 'Эротика', value: 'erotika' },
      { label: 'Эротическая фантастика', value: 'eroticheskaya-fantastika' },
      { label: 'Эротический фанфик', value: 'eroticheskii-fanfik' },
      { label: 'Эротическое фэнтези', value: 'eroticheskoe-fentezi' },
      { label: 'Юмористический детектив', value: 'yumoristicheskii-detektiv' },
      { label: 'Юмористическое фэнтези', value: 'yumoristicheskoe-fentezi' },
    ],
    inputType: FilterInputs.Checkbox,
  },
];

const BookRiverScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default BookRiverScraper;
