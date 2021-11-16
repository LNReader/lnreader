import MadaraScraper from './MadaraScraper';

const getPath = extensionId => {
  const path = {
    38: {novels: 'manga', novel: 'manga', chapter: 'manga'},
    39: {novels: 'series', novel: 'series', chapter: 'series'},
    40: {novels: 'novels', novel: 'novel', chapter: 'novel'},
    41: {novels: 'manga', novel: 'manga', chapter: 'manga'},
    42: {novels: 'all-novels', novel: 'manga', chapter: 'manga'},
    43: {novels: 'series', novel: 'series', chapter: 'series'},
    44: {novels: 'series', novel: 'series', chapter: 'series'},
    45: {novels: 'novel', novel: 'novel', chapter: 'novel'},
    46: {novels: 'novel', novel: 'novel', chapter: 'novel'},
    47: {novels: 'novel-list', novel: 'novel', chapter: 'novel'},
    55: {novels: 'manga', novel: 'manga', chapter: 'manga'},
    56: {novels: 'novel', novel: 'novel', chapter: 'novel'},
    57: {novels: 'series', novel: 'series', chapter: 'series'},
    58: {novels: 'novel', novel: 'novel', chapter: 'novel'},
    59: {novels: 'novel', novel: 'novels', chapter: 'novel'},
    60: {novels: 'novel', novel: 'novel', chapter: 'novel'},
    61: {novels: 'novel', novel: 'novel', chapter: 'novel'},
    62: {novels: 'novel', novel: 'novel', chapter: 'novel'},
    63: {novels: 'novel', novel: 'novel', chapter: 'novel'},
    75: {novels: 'series', novel: 'series', chapter: 'series'},
    80: {novels: 'manga', novel: 'manga', chapter: 'manga'},
    91: {novels: 'novel', novel: 'novel', chapter: 'novel'},
  };

  return (
    path[extensionId] || {
      novels: 'novel',
      novel: 'novel',
      chapter: 'novel',
    }
  );
};

export const BoxNovelScraper = new MadaraScraper(
  1,
  'https://boxnovel.com/',
  'BoxNovel',
  getPath(1),
  true,
);

export const SkyNovelScraper = new MadaraScraper(
  38,
  'https://skynovel.org/',
  'SkyNovel',
  getPath(38),
);

export const NovelCakeScraper = new MadaraScraper(
  39,
  'https://novelcake.com/',
  'NovelCake',
  getPath(39),
);

export const NovelsRockScraper = new MadaraScraper(
  40,
  'https://novelsrock.com/',
  'NovelsRock',
  getPath(40),
);

export const ZinnNovelScraper = new MadaraScraper(
  41,
  'https://zinnovel.com/',
  'ZinnNovel',
  getPath(41),
);

export const NovelTranslateScraper = new MadaraScraper(
  42,
  'https://noveltranslate.com/',
  'NovelTranslate',
  getPath(42),
);

export const LunarLettersScraper = new MadaraScraper(
  43,
  'https://www.lunarletters.com/',
  'LunarLetters',
  getPath(43),
  true,
);

export const SleepyTranslationsScraper = new MadaraScraper(
  44,
  'https://sleepytranslations.com/',
  'SleepyTranslations',
  getPath(44),
  true,
);

export const FreeNovelScraper = new MadaraScraper(
  45,
  'https://freenovel.me/',
  'FreeNovelMe',
  getPath(45),
);

export const FirstKissNovelScraper = new MadaraScraper(
  46,
  'https://1stkissnovel.love/',
  '1stKissNovel',
  getPath(46),
);

export const DaoNovelScraper = new MadaraScraper(
  47,
  'https://daonovel.com/',
  'DaoNovel',
  getPath(47),
  true,
);

export const MostNovelScraper = new MadaraScraper(
  55,
  'https://mostnovel.com/',
  'MostNovel',
  getPath(55),
);

export const NovelMultiverseScraper = new MadaraScraper(
  56,
  'https://www.novelmultiverse.com/',
  'NovelMultiverse',
  getPath(56),
);

export const LightNovelHeavenScraper = new MadaraScraper(
  57,
  'https://lightnovelheaven.com/',
  'LightNovelHeaven',
  getPath(57),
  true,
);

export const LightNovelsHubScraper = new MadaraScraper(
  58,
  'https://lightnovelshub.com/',
  'LightNovelsHub',
  getPath(58),
  true,
);

export const MeionNovelScraper = new MadaraScraper(
  60,
  'https://meionovel.id/',
  'MeioNovel',
  getPath(60),
  true,
  1,
);

export const WebNovelLoverScraper = new MadaraScraper(
  61,
  'https://www.webnovelover.com/',
  'WebNovelLover',
  getPath(61),
);

export const BoxNovelOnlineScraper = new MadaraScraper(
  63,
  'https://tipnovel.com/',
  'TipNovel',
  getPath(63),
  true,
);

export const ClickNovelScraper = new MadaraScraper(
  64,
  'https://clicknovel.net/',
  'ClickNovel',
  getPath(64),
);

export const ReadWebNovelsScraper = new MadaraScraper(
  65,
  'https://readwebnovels.net/',
  'ReadWebNovels',
  getPath(65),
);

export const WBNovelScraper = new MadaraScraper(
  66,
  'https://wbnovel.com/',
  'WBNovel',
  getPath(66),
);

export const WuxiaWorldDotSiteScraper = new MadaraScraper(
  74,
  'https://wuxiaworld.site/',
  'WuxiaWorld.Site',
  getPath(74),
);

export const MysticalSeriesScraper = new MadaraScraper(
  75,
  'https://mysticalmerries.com/',
  'MysticalSeries',
  getPath(75),
  true,
);

export const MoreNovelScraper = new MadaraScraper(
  84,
  'https://morenovel.net/',
  'MoreNovel',
  getPath(84),
  true,
);

export const OnlyMTLScraper = new MadaraScraper(
  91,
  'https://www.onlymtl.com/',
  'OnlyMTL',
  getPath(91),
);
