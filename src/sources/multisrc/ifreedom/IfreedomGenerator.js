import { FilterInputs } from '../../types/filterTypes';
import MultiSrcScraper from './IfreedomScraper';

const defaultFilter = [
  {
    key: 'sort',
    inputType: FilterInputs.Picker,
    label: 'Сортировка:',
    values: [
      { label: 'По дате добавления', value: 'По дате добавления' },
      { label: 'По дате обновления', value: 'По дате обновления' },
      { label: 'По количеству глав', value: 'По количеству глав' },
      { label: 'По названию', value: 'По названию' },
      { label: 'По просмотрам', value: 'По просмотрам' },
      { label: 'По рейтингу', value: 'По рейтингу' },
    ],
  },
  {
    key: 'status',
    inputType: FilterInputs.Checkbox,
    label: 'Статус:',
    values: [
      { label: 'Перевод активен', value: 'Перевод активен' },
      { label: 'Перевод приостановлен', value: 'Перевод приостановлен' },
      { label: 'Произведение завершено', value: 'Произведение завершено' },
    ],
  },
  {
    key: 'lang',
    inputType: FilterInputs.Checkbox,
    label: 'Язык:',
    values: [
      { label: 'Английский', value: 'Английский' },
      { label: 'Китайский', value: 'Китайский' },
      { label: 'Корейский', value: 'Корейский' },
      { label: 'Японский', value: 'Японский' },
    ],
  },
  {
    key: 'genre',
    inputType: FilterInputs.Checkbox,
    label: 'Жанры:',
    values: [
      { label: 'Боевик', value: 'Боевик' },
      { label: 'Боевые Искусства', value: 'Боевые Искусства' },
      { label: 'Вампиры', value: 'Вампиры' },
      { label: 'Виртуальный Мир', value: 'Виртуальный Мир' },
      { label: 'Гарем', value: 'Гарем' },
      { label: 'Героическое фэнтези', value: 'Героическое фэнтези' },
      { label: 'Детектив', value: 'Детектив' },
      { label: 'Дзёсэй', value: 'Дзёсэй' },
      { label: 'Драма', value: 'Драма' },
      { label: 'Игра', value: 'Игра' },
      { label: 'История', value: 'История' },
      { label: 'Киберпанк', value: 'Киберпанк' },
      { label: 'Комедия', value: 'Комедия' },
      { label: 'ЛитРПГ', value: 'ЛитРПГ' },
      { label: 'Меха', value: 'Меха' },
      { label: 'Милитари', value: 'Милитари' },
      { label: 'Мистика', value: 'Мистика' },
      { label: 'Научная Фантастика', value: 'Научная Фантастика' },
      { label: 'Повседневность', value: 'Повседневность' },
      { label: 'Постапокалипсис', value: 'Постапокалипсис' },
      { label: 'Приключения', value: 'Приключения' },
      { label: 'Психология', value: 'Психология' },
      { label: 'Романтика', value: 'Романтика' },
      { label: 'Сверхъестественное', value: 'Сверхъестественное' },
      { label: 'Сёдзё', value: 'Сёдзё' },
      { label: 'Сёнэн', value: 'Сёнэн' },
      { label: 'Сёнэн-ай', value: 'Сёнэн-ай' },
      { label: 'Спорт', value: 'Спорт' },
      { label: 'Сэйнэн', value: 'Сэйнэн' },
      { label: 'Сюаньхуа', value: 'Сюаньхуа' },
      { label: 'Трагедия', value: 'Трагедия' },
      { label: 'Триллер', value: 'Триллер' },
      { label: 'Ужасы', value: 'Ужасы' },
      { label: 'Фантастика', value: 'Фантастика' },
      { label: 'Фэнтези', value: 'Фэнтези' },
      { label: 'Школьная жизнь', value: 'Школьная жизнь' },
      { label: 'Экшн', value: 'Экшн' },
      { label: 'Эротика', value: 'Эротика' },
      { label: 'Этти', value: 'Этти' },
      { label: 'Яой', value: 'Яой' },
      { label: 'Adult', value: 'Adult' },
      { label: 'Mature', value: 'Mature' },
      { label: 'Xianxia', value: 'Xianxia' },
      { label: 'Xuanhuan', value: 'Xuanhuan' },
    ],
  },
];

const IfreedomScraper = new MultiSrcScraper(
  171,
  'https://ifreedom.su',
  'Свободный Мир Ранобэ',
  defaultFilter,
);

const BookhamsterScraper = new MultiSrcScraper(
  172,
  'https://bookhamster.ru',
  'Bookhamster',
  defaultFilter,
);

export { IfreedomScraper, BookhamsterScraper };
