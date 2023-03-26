import MultiSrcScraper from './NovelTlScraper';

const RuRanobeScraper = new MultiSrcScraper(
  149,
  'https://ruranobe.ru',
  'РуРанобэ',
);

const UkrRanobeScraper = new MultiSrcScraper(
  150,
  'https://ukr.novel.tl',
  'Переклади українською мовою',
);

const NightnovelScraper = new MultiSrcScraper(
  151,
  'https://nightnovel.online',
  'Nightnovel',
);

const KgRanobeScraper = new MultiSrcScraper(
  152,
  'https://kg.novel.tl',
  'Карманная галактика',
);

const AxelScraper = new MultiSrcScraper(
  153,
  'https://axel.znovel.space',
  'Аксел',
);

const SferdrakonScraper = new MultiSrcScraper(
  154,
  'https://sferdrakon.novel.tl',
  'Уголок дракона',
);

const OriginalScraper = new MultiSrcScraper(
  155,
  'Авторские работы',
  'https://original.novel.tl',
);

const SnailulitkaScraper = new MultiSrcScraper(
  156,
  'https://snailulitka.novel.tl',
  'Snailulitka',
);

const TsundokuScraper = new MultiSrcScraper(
  157,
  'https://tsundoku.novel.tl',
  'TsundokuTrans',
);

const JapitScraper = new MultiSrcScraper(
  158,
  'https://japit.novel.tl',
  'Japit Comics',
);

const BelScraper = new MultiSrcScraper(159, 'https://bel.novel.tl', 'Белманга');

const RedScraper = new MultiSrcScraper(
  160,
  'https://red.novel.tl',
  'Север и Юг',
);

const SivensiTeamScraper = new MultiSrcScraper(
  161,
  'https://SivensiTeam.novel.tl',
  'SivensiTeam',
);

const SiScraper = new MultiSrcScraper(
  162,
  'https://si.novel.tl',
  'Сказочные истории',
);

const KodScraper = new MultiSrcScraper(163, 'https://kod.novel.tl', 'K.O.D.');

const YinandyangScraper = new MultiSrcScraper(
  164,
  'https://yinandyang.novel.tl',
  'Инь-Ян',
);

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
  SivensiTeamScraper,
  SiScraper,
  KodScraper,
  YinandyangScraper,
};
