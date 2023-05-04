import { FilterInputs } from '../../types/filterTypes';
import MultiSrcScraper from './NovelTlScraper';

const RuRanobeScraper = new MultiSrcScraper(
  149,
  'https://ruranobe.ru',
  'РуРанобэ',
  [
    {
      key: 'tags',
      label: 'Тэги',
      values: [
        {
          label: 'Автоматы',
          value: 64,
        },
        {
          label: 'Агрессивные персонажи',
          value: 26,
        },
        {
          label: 'Ад',
          value: 338,
        },
        {
          label: 'Адаптация манги',
          value: 8,
        },
        {
          label: 'Академия',
          value: 5,
        },
        {
          label: 'Алхимия',
          value: 27,
        },
        {
          label: 'Альтернативная реальность',
          value: 30,
        },
        {
          label: 'Амнезия',
          value: 31,
        },
        {
          label: 'Анабиоз',
          value: 170,
        },
        {
          label: 'Ангелы',
          value: 38,
        },
        {
          label: 'Андроиды',
          value: 37,
        },
        {
          label: 'Антигерой',
          value: 43,
        },
        {
          label: 'Антимагия',
          value: 41,
        },
        {
          label: 'Апатичный главный герой',
          value: 46,
        },
        {
          label: 'Апокалипсис',
          value: 47,
        },
        {
          label: 'Аристократия',
          value: 51,
        },
        {
          label: 'Артефакты',
          value: 58,
        },
        {
          label: 'Асоциальный главный герой',
          value: 42,
        },
        {
          label: 'R-15',
          value: 570,
        },
        {
          label: 'R-18',
          value: 571,
        },
      ],
      inputType: FilterInputs.Checkbox,
    },
  ],
);

const UkrRanobeScraper = new MultiSrcScraper(
  150,
  'https://ukr.novel.tl',
  'Переклади українською мовою',
  [
    {
      key: 'tags',
      label: 'Тэги',
      values: [
        {
          label: 'Альтернативная реальность',
          value: 30,
        },
        {
          label: 'Апатичный главный герой',
          value: 46,
        },
        {
          label: 'Асоциальный главный герой',
          value: 42,
        },
        {
          label: 'Владелец уникального оружия',
          value: 736,
        },
        {
          label: 'Гарем рабов',
          value: 656,
        },
        {
          label: 'Герои',
          value: 341,
        },
        {
          label: 'Героиня красавица',
          value: 81,
        },
        {
          label: 'Герой использует щит',
          value: 636,
        },
        {
          label: 'Герой-трудяга',
          value: 330,
        },
        {
          label: 'Главный герой — мужчина',
          value: 419,
        },
        {
          label: 'Глухой к любви герой',
          value: 194,
        },
        {
          label: 'Демоны',
          value: 193,
        },
        {
          label: 'Друзья детства',
          value: 128,
        },
        {
          label: 'Есть аниме-адаптация',
          value: 10,
        },
        {
          label: 'Есть манга-адаптация',
          value: 14,
        },
        {
          label: 'Есть CD дорама-адаптация',
          value: 12,
        },
        {
          label: 'Зверолюди',
          value: 39,
        },
        {
          label: 'Магия',
          value: 412,
        },
        {
          label: 'Магия призыва',
          value: 694,
        },
        {
          label: 'От слабого к сильному',
          value: 752,
        },
      ],
      inputType: FilterInputs.Checkbox,
    },
  ],
);

const NightnovelScraper = new MultiSrcScraper(
  151,
  'https://nightnovel.online',
  'Nightnovel',
  [
    {
      key: 'tags',
      label: 'Тэги',
      values: [
        {
          label: 'Альтернативная реальность',
          value: 30,
        },
        {
          label: 'Амнезия',
          value: 31,
        },
        {
          label: 'Анал',
          value: 33,
        },
        {
          label: 'Ангелы',
          value: 38,
        },
        {
          label: 'Аристократия',
          value: 51,
        },
        {
          label: 'Артефакты',
          value: 58,
        },
        {
          label: 'Ассасины',
          value: 61,
        },
        {
          label: 'Банды',
          value: 302,
        },
        {
          label: 'БДСМ',
          value: 77,
        },
        {
          label: 'Беременность',
          value: 551,
        },
        {
          label: 'Боги',
          value: 318,
        },
        {
          label: 'Богини',
          value: 316,
        },
        {
          label: 'Боевая академия',
          value: 75,
        },
        {
          label: 'Божественная сила',
          value: 317,
        },
        {
          label: 'Влияние прошлого',
          value: 517,
        },
        {
          label: 'Враги становятся союзниками',
          value: 238,
        },
        {
          label: 'Вынужденные условия проживания',
          value: 287,
        },
        {
          label: 'Герои',
          value: 341,
        },
        {
          label: 'Героиня красавица',
          value: 81,
        },
        {
          label: 'R-18',
          value: 571,
        },
      ],
      inputType: FilterInputs.Checkbox,
    },
  ],
);

const KgRanobeScraper = new MultiSrcScraper(
  152,
  'https://kg.novel.tl',
  'Карманная галактика',
  [
    {
      key: 'tags',
      label: 'Тэги',
      values: [
        {
          label: 'Алхимия',
          value: 27,
        },
        {
          label: 'Андроиды',
          value: 37,
        },
        {
          label: 'Анти-рост персонажа',
          value: 25,
        },
        {
          label: 'Антигерой',
          value: 43,
        },
        {
          label: 'Апатичный главный герой',
          value: 46,
        },
        {
          label: 'Аристократия',
          value: 51,
        },
        {
          label: 'Асоциальный главный герой',
          value: 42,
        },
        {
          label: 'Ассасины',
          value: 61,
        },
        {
          label: 'Беззаботный герой',
          value: 115,
        },
        {
          label: 'Безработные',
          value: 377,
        },
        {
          label: 'Бессмертные',
          value: 359,
        },
        {
          label: 'Библиотека',
          value: 393,
        },
        {
          label: 'Боги',
          value: 318,
        },
        {
          label: 'Боевая академия',
          value: 75,
        },
        {
          label: 'Бывший герой',
          value: 290,
        },
        {
          label: 'Ведьмы',
          value: 756,
        },
        {
          label: 'Везучий главный герой',
          value: 411,
        },
        {
          label: 'Верные подданные',
          value: 410,
        },
        {
          label: 'Взросление персонажа',
          value: 24,
        },
        {
          label: 'R-15',
          value: 570,
        },
      ],
      inputType: FilterInputs.Checkbox,
    },
  ],
);

const AxelScraper = new MultiSrcScraper(
  153,
  'https://axel.znovel.space',
  'Аксел',
  [
    {
      key: 'tags',
      label: 'Тэги',
      values: [
        {
          label: 'Богини',
          value: 316,
        },
        {
          label: 'Везучий главный герой',
          value: 411,
        },
        {
          label: 'Виртуальная реальность',
          value: 744,
        },
        {
          label: 'Высокомерный герой',
          value: 56,
        },
        {
          label: 'Герой-извращенец',
          value: 521,
        },
        {
          label: 'Главная героиня — женщина',
          value: 277,
        },
        {
          label: 'Главный герой — мужчина',
          value: 419,
        },
        {
          label: 'Дворяне',
          value: 487,
        },
        {
          label: 'Девочки-волшебницы',
          value: 415,
        },
        {
          label: 'Демоны',
          value: 193,
        },
        {
          label: 'Дружба',
          value: 293,
        },
        {
          label: 'Есть аниме-адаптация',
          value: 10,
        },
        {
          label: 'Есть видеоигра',
          value: 13,
        },
        {
          label: 'Есть манга-адаптация',
          value: 14,
        },
        {
          label: 'Игра на выживание',
          value: 696,
        },
        {
          label: 'Из грязи в князи',
          value: 542,
        },
        {
          label: 'Королевская особа',
          value: 596,
        },
        {
          label: 'Ленивый главный герой',
          value: 389,
        },
        {
          label: 'Маги',
          value: 757,
        },
        {
          label: 'Магические технологии',
          value: 417,
        },
      ],
      inputType: FilterInputs.Checkbox,
    },
  ],
);

const SferdrakonScraper = new MultiSrcScraper(
  154,
  'https://sferdrakon.novel.tl',
  'Уголок дракона',
  [
    {
      key: 'tags',
      label: 'Тэги',
      values: [
        {
          label: 'Главный герой — мужчина',
          value: 419,
        },
        {
          label: 'Демоны',
          value: 193,
        },
        {
          label: 'Драконы',
          value: 218,
        },
        {
          label: 'Есть аниме-адаптация',
          value: 10,
        },
        {
          label: 'Есть видеоигра',
          value: 13,
        },
        {
          label: 'Есть манга-адаптация',
          value: 14,
        },
        {
          label: 'Звероподобные',
          value: 79,
        },
        {
          label: 'Изнасилование',
          value: 574,
        },
        {
          label: 'Королевская особа',
          value: 596,
        },
        {
          label: 'Магия',
          value: 412,
        },
        {
          label: 'Магия призыва',
          value: 694,
        },
        {
          label: 'Наездники на драконах',
          value: 216,
        },
        {
          label: 'Рыцари',
          value: 383,
        },
        {
          label: 'Цундере',
          value: 728,
        },
        {
          label: 'Эльфы',
          value: 235,
        },
      ],
      inputType: FilterInputs.Checkbox,
    },
  ],
);

const OriginalScraper = new MultiSrcScraper(
  155,
  'Авторские работы',
  'https://original.novel.tl',
  [
    {
      key: 'tags',
      label: 'Тэги',
      values: [
        {
          label: 'Агрессивные персонажи',
          value: 26,
        },
        {
          label: 'Академия',
          value: 5,
        },
        {
          label: 'Андроиды',
          value: 37,
        },
        {
          label: 'Антимагия',
          value: 41,
        },
        {
          label: 'Аристократия',
          value: 51,
        },
        {
          label: 'Артефакты',
          value: 58,
        },
        {
          label: 'Брошенные дети',
          value: 1,
        },
        {
          label: 'Вероломные герои/плетение интриг',
          value: 424,
        },
        {
          label: 'Взросление персонажа',
          value: 24,
        },
        {
          label: 'Владелец уникального оружия',
          value: 736,
        },
        {
          label: 'Герой-извращенец',
          value: 521,
        },
        {
          label: 'Главный герой не человек',
          value: 488,
        },
        {
          label: 'Государственные интриги',
          value: 212,
        },
        {
          label: 'Душещипательная история',
          value: 335,
        },
        {
          label: 'Жестокие персонажи',
          value: 4,
        },
        {
          label: 'Зверолюди',
          value: 39,
        },
        {
          label: 'Знания из прошлой жизни',
          value: 553,
        },
        {
          label: 'Искусственный интеллект',
          value: 59,
        },
        {
          label: 'Конфликт в семье',
          value: 261,
        },
        {
          label: 'Королевства',
          value: 382,
        },
      ],
      inputType: FilterInputs.Checkbox,
    },
  ],
);

const SnailulitkaScraper = new MultiSrcScraper(
  156,
  'https://snailulitka.novel.tl',
  'Snailulitka',
  [
    {
      key: 'tags',
      label: 'Тэги',
      values: [
        {
          label: 'Алхимия',
          value: 27,
        },
        {
          label: 'Ассасины',
          value: 61,
        },
        {
          label: 'Бедный главный герой',
          value: 541,
        },
        {
          label: 'Богачи',
          value: 753,
        },
        {
          label: 'Виртуальная реальность',
          value: 744,
        },
        {
          label: 'Война',
          value: 750,
        },
        {
          label: 'Геймеры',
          value: 301,
        },
        {
          label: 'Героиня красавица',
          value: 81,
        },
        {
          label: 'Герой красавец',
          value: 329,
        },
        {
          label: 'Гильдии',
          value: 324,
        },
        {
          label: 'Главный герой - гений',
          value: 308,
        },
        {
          label: 'Главный герой — знаменитость',
          value: 263,
        },
        {
          label: 'Главный герой — мужчина',
          value: 419,
        },
        {
          label: 'Дворфы',
          value: 224,
        },
        {
          label: 'Драконы',
          value: 218,
        },
        {
          label: 'Есть маньхуа-адаптация',
          value: 15,
        },
        {
          label: 'Игровая рейтинговая система',
          value: 300,
        },
        {
          label: 'Книги навыков',
          value: 654,
        },
        {
          label: 'Лекари',
          value: 334,
        },
        {
          label: 'Месть',
          value: 588,
        },
      ],
      inputType: FilterInputs.Checkbox,
    },
  ],
);

const TsundokuScraper = new MultiSrcScraper(
  157,
  'https://tsundoku.novel.tl',
  'TsundokuTrans',
  [
    {
      key: 'tags',
      label: 'Тэги',
      values: [
        {
          label: 'Боги',
          value: 318,
        },
        {
          label: 'Боевая академия',
          value: 75,
        },
        {
          label: 'Вампиры',
          value: 742,
        },
        {
          label: 'Влияние прошлого',
          value: 517,
        },
        {
          label: 'Война',
          value: 750,
        },
        {
          label: 'Главная героиня — женщина',
          value: 277,
        },
        {
          label: 'Главный герой — мужчина',
          value: 419,
        },
        {
          label: 'Демоны',
          value: 193,
        },
        {
          label: 'Драконы',
          value: 218,
        },
        {
          label: 'Королевская особа',
          value: 596,
        },
        {
          label: 'Коррупция',
          value: 157,
        },
        {
          label: 'Магия',
          value: 412,
        },
        {
          label: 'Мастер подземелий',
          value: 222,
        },
        {
          label: 'Мечи и магия',
          value: 697,
        },
        {
          label: 'Мечники',
          value: 698,
        },
        {
          label: 'Монстры',
          value: 454,
        },
        {
          label: 'Недооцененный главный герой',
          value: 734,
        },
        {
          label: 'От слабого к сильному',
          value: 752,
        },
        {
          label: 'R-15',
          value: 570,
        },
        {
          label: 'R-18',
          value: 571,
        },
      ],
      inputType: FilterInputs.Checkbox,
    },
  ],
);

const JapitScraper = new MultiSrcScraper(
  158,
  'https://japit.novel.tl',
  'Japit Comics',
  [
    {
      key: 'tags',
      label: 'Тэги',
      values: [
        {
          label: 'Академия',
          value: 5,
        },
        {
          label: 'Андроиды',
          value: 37,
        },
        {
          label: 'Беззаботный герой',
          value: 115,
        },
        {
          label: 'Боги',
          value: 318,
        },
        {
          label: 'Богини',
          value: 316,
        },
        {
          label: 'Вампиры',
          value: 742,
        },
        {
          label: 'Везучий главный герой',
          value: 411,
        },
        {
          label: 'Влияние прошлого',
          value: 517,
        },
        {
          label: 'Внезапное обогащение',
          value: 691,
        },
        {
          label: 'Военные хроники',
          value: 749,
        },
        {
          label: 'Война',
          value: 750,
        },
        {
          label: 'Воспоминания прошлого',
          value: 283,
        },
        {
          label: 'Герои',
          value: 341,
        },
        {
          label: 'Героиня красавица',
          value: 81,
        },
        {
          label: 'Герой влюбляется первым',
          value: 561,
        },
        {
          label: 'Герой красавец',
          value: 329,
        },
        {
          label: 'Герой-бесстыдник',
          value: 632,
        },
        {
          label: 'Герой-извращенец',
          value: 521,
        },
        {
          label: 'Герой-трудяга',
          value: 330,
        },
        {
          label: 'R-15',
          value: 570,
        },
      ],
      inputType: FilterInputs.Checkbox,
    },
  ],
);

const BelScraper = new MultiSrcScraper(159, 'https://bel.novel.tl', 'Белманга');

const RedScraper = new MultiSrcScraper(
  160,
  'https://red.novel.tl',
  'Север и Юг',
  [
    {
      key: 'tags',
      label: 'Тэги',
      values: [
        {
          label: 'Героиня красавица',
          value: 81,
        },
        {
          label: 'Герой влюбляется первым',
          value: 561,
        },
        {
          label: 'Главный герой — мужчина',
          value: 419,
        },
        {
          label: 'Дружба',
          value: 293,
        },
        {
          label: 'Жизнь в одиночку',
          value: 396,
        },
        {
          label: 'Сложные семейные отношения',
          value: 149,
        },
      ],
      inputType: FilterInputs.Checkbox,
    },
  ],
);

const SiScraper = new MultiSrcScraper(
  161,
  'https://si.novel.tl',
  'Сказочные истории',
  [
    {
      key: 'tags',
      label: 'Тэги',
      values: [
        {
          label: 'Аристократия',
          value: 51,
        },
        {
          label: 'Война',
          value: 750,
        },
        {
          label: 'Главная героиня — женщина',
          value: 277,
        },
        {
          label: 'Драконы',
          value: 218,
        },
        {
          label: 'Древний Китай',
          value: 34,
        },
        {
          label: 'Жестокие персонажи',
          value: 4,
        },
        {
          label: 'Злобные благородные девы',
          value: 743,
        },
        {
          label: 'Комедийный подтекст',
          value: 147,
        },
        {
          label: 'Культивация',
          value: 171,
        },
        {
          label: 'Магия',
          value: 412,
        },
        {
          label: 'Отомэ-игры',
          value: 504,
        },
        {
          label: 'Перерождение в другом мире',
          value: 580,
        },
        {
          label: 'Перерождение в другом мире',
          value: 720,
        },
        {
          label: 'Повелитель демонов',
          value: 191,
        },
        {
          label: 'Попаданец в другой мир',
          value: 723,
        },
        {
          label: 'Смерть',
          value: 185,
        },
        {
          label: 'Средневековье',
          value: 436,
        },
        {
          label: 'Фэнтези',
          value: 267,
        },
        {
          label: 'Харизматичный протагонист',
          value: 120,
        },
        {
          label: 'Хитрый главный герой',
          value: 173,
        },
      ],
      inputType: FilterInputs.Checkbox,
    },
  ],
);

const KodScraper = new MultiSrcScraper(162, 'https://kod.novel.tl', 'K.O.D.', [
  {
    key: 'tags',
    label: 'Тэги',
    values: [
      {
        label: 'Актёрское искусство',
        value: 7,
      },
      {
        label: 'Забота о детях',
        value: 127,
      },
      {
        label: 'Управление бизнесом',
        value: 109,
      },
      {
        label: 'Шоу-бизнес',
        value: 642,
      },
    ],
    inputType: FilterInputs.Checkbox,
  },
]);

export {
  RuRanobeScraper,
  UkrRanobeScraper,
  NightnovelScraper,
  KgRanobeScraper,
  AxelScraper,
  SferdrakonScraper,
  OriginalScraper,
  SnailulitkaScraper,
  TsundokuScraper,
  JapitScraper,
  BelScraper,
  RedScraper,
  SiScraper,
  KodScraper,
};
