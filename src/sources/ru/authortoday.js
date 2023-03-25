import { Status, defaultCoverUri } from '../helpers/constants';
import { htmlToText } from '../helpers/htmlToText';
import { FilterInputs } from '../types/filterTypes';
import * as cheerio from 'cheerio';
import { defaultTo } from 'lodash-es';
import dayjs from 'dayjs';

const sourceId = 142;
const sourceName = 'Автор Тудей';

const baseUrl = 'https://author.today';
const apiUrl = 'https://api.author.today/';

const token = 'Bearer guest';
var UserId = '';

const popularNovels = async (page, { showLatestNovels, filters }) => {
  let url = apiUrl + 'v1/catalog/search?page=' + page;
  if (filters?.genre) {
    url += '&genre=' + filters.genre;
  }

  url +=
    '&sorting=' +
    defaultTo(filters?.sort, showLatestNovels ? 'recent' : 'popular');

  url += '&form=' + defaultTo(filters?.form, 'any');
  url += '&state=' + defaultTo(filters?.state, 'any');
  url += '&series=' + defaultTo(filters?.series, 'any');
  url += '&access=' + defaultTo(filters?.access, 'any');
  url += '&promo=' + defaultTo(filters?.promo, 'hide');

  const result = await fetch(url, {
    headers: {
      Authorization: token,
    },
  });
  const json = await result.json();

  if (json?.code === 'NotFound') {
    return { novels: [] };
  }

  let novels = json.searchResults.map(novel => ({
    sourceId,
    novelName: novel.title,
    novelCover: novel?.coverUrl
      ? 'https://cm.author.today/content/' + novel.coverUrl
      : defaultCoverUri,
    novelUrl: Math.floor(novel.id).toString(),
  }));

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  let result = await fetch(`${apiUrl}v1/work/${novelUrl}/details`, {
    headers: {
      Authorization: token,
    },
  });
  let json = await result.json();

  let novel = {
    sourceId,
    sourceName,
    url: baseUrl + '/work/' + novelUrl,
    novelUrl,
    novelName: json.title,
    novelCover: json?.coverUrl ? json.coverUrl.split('?')[0] : defaultCoverUri,
    author:
      json?.originalAuthor ||
      json?.authorFIO ||
      json?.coAuthorFIO ||
      json?.secondCoAuthorFIO ||
      json?.translator ||
      '',
    genre: json?.tags?.join(','),
    status: json?.isFinished ? Status.COMPLETED : Status.ONGOING,
  };

  novel.summary = '';
  novel.summary += json?.annotation ? htmlToText(json.annotation) + '\n' : '';
  novel.summary += json?.authorNotes
    ? 'Примечания автора:\n' + htmlToText(json.authorNotes)
    : '';

  // all chapters
  result = await fetch(`${apiUrl}v1/work/${novelUrl}/content`, {
    headers: {
      Authorization: token,
    },
  });
  json = await result.json();
  let chapters = [];

  json?.forEach(chapter => {
    if (chapter?.isAvailable && !chapter?.isDraft) {
      chapters.push({
        chapterName: chapter.title,
        releaseDate: dayjs(
          chapter?.publishTime || chapter.lastModificationTime,
        ).format('LLL'),
        chapterUrl: Math.floor(chapter.id).toString(),
      });
    }
  });

  novel.chapters = chapters;
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  let url = `${apiUrl}v1/work/${novelUrl}/chapter/${chapterUrl}/text`;
  const result = await fetch(url, {
    headers: {
      Authorization: token,
    },
  });
  const json = await result.json();

  if (json?.code) {
    return {
      sourceId,
      novelUrl,
      chapterUrl,
      chapterText: json.code + '\n' + json?.message,
    };
  }

  let key = json.key.split('').reverse().join('') + '@_@' + UserId;
  let text = '';

  for (let i = 0; i < json.text.length; i++) {
    text += String.fromCharCode(
      json.text.charCodeAt(i) ^ key.charCodeAt(Math.floor(i % key.length)),
    );
  }

  let loadedCheerio = cheerio.load(text);
  loadedCheerio('img').each(function () {
    if (!loadedCheerio(this).attr('src')?.startsWith('http')) {
      let src = loadedCheerio(this).attr('src');
      loadedCheerio(this).attr('src', baseUrl + src);
    }
  });

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName: json.title,
    chapterText: loadedCheerio.html(),
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  let url = `${baseUrl}/search?category=works&q=${searchTerm}`;
  const result = await fetch(url, {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0',
    referer: baseUrl,
  });
  const body = await result.text();
  let loadedCheerio = cheerio.load(body);
  let novels = [];

  loadedCheerio('div.book-row').each(function () {
    const novelName = loadedCheerio(this)
      .find('div[class="book-title"] a')
      .text()
      .trim();
    let novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this)
      .find('div[class="book-title"] a')
      .attr('href')
      .split('/')[2];

    if (novelCover) {
      novelCover = novelCover.split('?')[0];
    } else {
      novelCover = defaultCoverUri;
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
      { label: 'По популярности', value: 'popular' },
      { label: 'По количеству лайков', value: 'likes' },
      { label: 'По комментариям', value: 'comments' },
      { label: 'По новизне', value: 'recent' },
      { label: 'По просмотрам', value: 'views' },
      { label: 'Набирающие популярность', value: 'trending' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'genre',
    label: 'Жанры',
    values: [
      { label: 'Альтернативная история', value: 'sf-history' },
      { label: 'Антиутопия', value: 'dystopia' },
      { label: 'Бизнес-литература', value: 'biznes-literatura' },
      { label: 'Боевая фантастика', value: 'sf-action' },
      { label: 'Боевик', value: 'action' },
      { label: 'Боевое фэнтези', value: 'fantasy-action' },
      { label: 'Бояръ-Аниме', value: 'boyar-anime' },
      { label: 'Героическая фантастика', value: 'sf-heroic' },
      { label: 'Героическое фэнтези', value: 'heroic-fantasy' },
      { label: 'Городское фэнтези', value: 'urban-fantasy' },
      { label: 'Детектив', value: 'detective' },
      { label: 'Детская литература', value: 'detskaya-literatura' },
      { label: 'Документальная проза', value: 'non-fiction' },
      { label: 'Историческая проза', value: 'historical-fiction' },
      { label: 'Исторические приключения', value: 'historical-adventure' },
      { label: 'Исторический детектив', value: 'historical-mystery' },
      { label: 'Исторический любовный роман', value: 'historical-romance' },
      { label: 'Историческое фэнтези', value: 'historical-fantasy' },
      { label: 'Киберпанк', value: 'cyberpunk' },
      { label: 'Короткий любовный роман', value: 'short-romance' },
      { label: 'Космическая фантастика', value: 'sf-space' },
      { label: 'ЛитРПГ', value: 'litrpg' },
      { label: 'Любовное фэнтези', value: 'love-fantasy' },
      { label: 'Любовные романы', value: 'romance' },
      { label: 'Мистика', value: 'paranormal' },
      { label: 'Научная фантастика', value: 'science-fiction' },
      { label: 'Подростковая проза', value: 'teen-prose' },
      { label: 'Политический роман', value: 'political-fiction' },
      { label: 'Попаданцы', value: 'popadantsy' },
      { label: 'Попаданцы в космос', value: 'popadantsy-v-kosmos' },
      {
        label: 'Попаданцы в магические миры',
        value: 'popadantsy-v-magicheskie-miry',
      },
      { label: 'Попаданцы во времени', value: 'popadantsy-vo-vremeni' },
      { label: 'Постапокалипсис', value: 'postapocalyptic' },
      { label: 'Поэзия', value: 'poetry' },
      { label: 'Приключения', value: 'adventure' },
      { label: 'Публицистика', value: 'publicism' },
      { label: 'Развитие личности', value: 'razvitie-lichnosti' },
      { label: 'Разное', value: 'other' },
      { label: 'РеалРПГ', value: 'realrpg' },
      { label: 'Романтическая эротика', value: 'romantic-erotika' },
      { label: 'Сказка', value: 'fairy-tale' },
      { label: 'Слэш', value: 'slash' },
      { label: 'Современная проза', value: 'modern-prose' },
      { label: 'Современный любовный роман', value: 'contemporary-romance' },
      { label: 'Социальная фантастика', value: 'sf-social' },
      { label: 'Стимпанк', value: 'steampunk' },
      { label: 'Темное фэнтези', value: 'dark-fantasy' },
      { label: 'Триллер', value: 'thriller' },
      { label: 'Ужасы', value: 'horror' },
      { label: 'Фантастика', value: 'sci-fi' },
      { label: 'Фантастический детектив', value: 'detective-science-fiction' },
      { label: 'Фанфик', value: 'fanfiction' },
      { label: 'Фемслэш', value: 'femslesh' },
      { label: 'Фэнтези', value: 'fantasy' },
      { label: 'Шпионский детектив', value: 'spy-mystery' },
      { label: 'Эпическое фэнтези', value: 'epic-fantasy' },
      { label: 'Эротика', value: 'erotica' },
      { label: 'Эротическая фантастика', value: 'sf-erotika' },
      { label: 'Эротический фанфик', value: 'fanfiction-erotika' },
      { label: 'Эротическое фэнтези', value: 'fantasy-erotika' },
      { label: 'Юмор', value: 'humor' },
      { label: 'Юмористическая фантастика', value: 'sf-humor' },
      { label: 'Юмористическое фэнтези', value: 'ironical-fantasy' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'form',
    label: 'Форма произведения',
    values: [
      { label: 'Любой', value: 'any' },
      { label: 'Перевод', value: 'translation' },
      { label: 'Повесть', value: 'tale' },
      { label: 'Рассказ', value: 'story' },
      { label: 'Роман', value: 'novel' },
      { label: 'Сборник поэзии', value: 'poetry' },
      { label: 'Сборник рассказов', value: 'story-book' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'state',
    label: 'Статус произведения',
    values: [
      { label: 'Любой статус', value: 'any' },
      { label: 'В процессе', value: 'in-progress' },
      { label: 'Завершено', value: 'finished' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'series',
    label: 'Статус цикла',
    values: [
      { label: 'Не важно', value: 'any' },
      { label: 'Вне цикла', value: 'out' },
      { label: 'Цикл завершен', value: 'finished' },
      { label: 'Цикл не завершен', value: 'unfinished' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'access',
    label: 'Тип доступа',
    values: [
      { label: 'Любой', value: 'any' },
      { label: 'Платный', value: 'paid' },
      { label: 'Бесплатный', value: 'free' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'promo',
    label: 'Промо-фрагмент',
    values: [
      { label: 'Скрывать', value: 'hide' },
      { label: 'Показывать', value: 'show' },
    ],
    inputType: FilterInputs.Picker,
  },
];

const AuthorTodayScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default AuthorTodayScraper;
