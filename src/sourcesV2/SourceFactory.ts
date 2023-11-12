import { AbstractSourceFactory } from './AbstractSourceFactory/AbstractSourceFactory';

import { ComradeMaoParser } from './en/ComradeMao/ComradeMao';
import { NovelUpdatesParser } from './en/NovelUpdates/NovelUpdates';
import { MadaraParser } from './multiSrc/Madara/MadaraParser';
import { WPMangaStreamParser } from './multiSrc/WPMangaStream/WPMangaStream';

const SourceFactory = new AbstractSourceFactory();

/**
 * Arabic
 */

/**
 * English
 */
SourceFactory.registerSource(new ComradeMaoParser());
SourceFactory.registerSource(new NovelUpdatesParser());

/**
 * Spanish
 */

/**
 * Japansese
 */

/**
 * Multi Sources
 */

/**
 * Madara
 */

SourceFactory.registerSource(
  new MadaraParser({
    id: 1,
    baseUrl: 'https://boxnovel.com/',
    name: 'BoxNovel',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/src/en/boxnovel/icon.png?raw=true',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 21,
    baseUrl: 'https://woopread.com/',
    name: 'WoopRead',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/src/en/woopread/icon.png?raw=true',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 39,
    baseUrl: 'https://novelcake.com/',
    name: 'NovelCake',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/novelcake.png?raw=true',
    options: {
      popularNovelsPath: 'series',
    },
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 40,
    baseUrl: 'https://novelsrock.com/',
    name: 'NovelsRock',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/novelsrock.png?raw=true',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 41,
    baseUrl: 'https://zinnovel.com/',
    name: 'ZinnNovel',
    options: {
      popularNovelsPath: 'manga',
    },
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/zinnovel.png?raw=true',

    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 42,
    baseUrl: 'https://noveltranslate.com/',
    name: 'NovelTranslate',
    options: {
      popularNovelsPath: 'all-novels',
    },
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/noveltranslate.png?raw=true',

    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 43,
    baseUrl: 'https://www.lunarletters.com/',
    name: 'LunarLetters',
    options: {
      popularNovelsPath: 'series',
    },
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/lunarletters.png?raw=true',

    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 44,
    baseUrl: 'https://sleepytranslations.com/',
    name: 'SleepyTranslations',
    options: {
      popularNovelsPath: 'series',
    },
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/sleepytranslations.png?raw=true',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 45,
    baseUrl: 'https://freenovel.me/',
    name: 'FreeNovelMe',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/freenovel.png?raw=true',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 46,
    baseUrl: 'https://1stkissnovel.love/',
    name: 'FirstKissNovel',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/1stkissnovel.png?raw=true',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 47,
    baseUrl: 'https://daonovel.com/',
    name: 'DaoNovel',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/daonovel.png?raw=true',
    options: {
      popularNovelsPath: 'novels-list',
    },
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 55,
    baseUrl: 'https://mostnovel.com/',
    name: 'MostNovel',
    options: {
      popularNovelsPath: 'manga',
    },
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/mostnovel.png?raw=true',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 56,
    baseUrl: 'https://www.novelmultiverse.com/',
    name: 'NovelMultiverse',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/novelmultiverse.png?raw=true',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 57,
    baseUrl: 'https://lightnovelheaven.com/',
    name: 'LightNovelHeaven',
    options: {
      popularNovelsPath: 'series',
    },
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/lightnovelheaven.png?raw=true',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 58,
    baseUrl: 'https://lightnovelshub.com/',
    name: 'LightNovelsHub',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/lightnovelshub.png?raw=true',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 59,
    baseUrl: 'https://arnovel.me/',
    name: 'ArNovel',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/arnovel.png?raw=true',
    lang: 'ar',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 60,
    baseUrl: 'https://meionovel.id/',
    name: 'MeioNovel',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/meionovel.png?raw=true',
    lang: 'id',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 96,
    baseUrl: 'https://hizomanga.com/',
    name: 'HizoManga',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/hizomanga.png?raw=true',
    lang: 'ar',
    options: {
      popularNovelsPath: 'serie',
    },
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 75,
    baseUrl: 'https://mysticalmerries.com/',
    name: 'MysticalSeries',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/mysticalseries.png?raw=true',
    options: {
      popularNovelsPath: 'series',
    },
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 126,
    name: 'Sweet Escape Translations',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/sweetescapetranslations.png?raw=true',
    baseUrl: 'https://sweetescapetranslations.com/',
    options: {
      useNewChapterEndpoint: false,
      popularNovelsPath: 'manga',
    },
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 141,
    baseUrl: 'https://novelr18.com/',
    name: 'NovelR18 ',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/novelr18.png?raw=true',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 135,
    baseUrl: 'https://zetrotranslation.com/',
    name: 'Zetro Translation',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/zetrotranslation.png?raw=true',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 138,
    baseUrl: 'https://sugarbbscan.com/',
    name: 'Sugar Babies',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/madara/icons/sugarbbscan.png?raw=true',
    options: {
      popularNovelsPath: 'series',
      useNewChapterEndpoint: false,
    },
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 143,
    baseUrl: 'https://www.webnoveloku.com/',
    name: 'WebNovelOku',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/multisrc/madara/icons/webnoveloku.png?raw=true',
    lang: 'tr',
    options: {
      useNewChapterEndpoint: false,
      reverseChapters: false,
    },
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 148,
    baseUrl: 'https://salmonlatte.com/',
    name: 'Salmon Latte',
    iconUrl:
      'https://salmonlatte.com/wp-content/uploads/2022/10/Copy-of-Salmon-Latte-Translations.png',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 149,
    baseUrl: 'https://galaxytranslations97.com/',
    name: 'Galaxy Translations',
    iconUrl:
      'https://i0.wp.com/galaxytranslations97.com/wp-content/uploads/2021/04/cropped-primordial-galaxy-696x392-1.jpg?fit=180%2C180&ssl=1',
    options: {
      popularNovelsPath: 'manga',
    },
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new MadaraParser({
    id: 151,
    baseUrl: 'https://novelutopia.com/',
    name: 'NovelUtopia',
    iconUrl: 'https://novelutopia.com/wp-content/uploads/2017/10/1.png',
    options: {
      useNewChapterEndpoint: false,
    },
    lang: 'en',
  }),
);

/**
 * WPMangaStream
 */
SourceFactory.registerSource(
  new WPMangaStreamParser({
    id: 123,
    baseUrl: 'https://lshnovel.com/',
    name: 'Liebe Schnee Hiver Novel',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/wpmangastream/icons/lshnovel.png?raw=true',
    lang: 'tr',
  }),
);

SourceFactory.registerSource(
  new WPMangaStreamParser({
    id: 129,
    baseUrl: 'https://lightnovelbrasil.com/',
    name: 'Light Novels Brasil',
    iconUrl:
      'https://github.com/LNReader/lnreader-sources/blob/main/icons/multisrc/wpmangastream/icons/lshnovel.png?raw=true',
    lang: 'pt-BR',
  }),
);

SourceFactory.registerSource(
  new WPMangaStreamParser({
    id: 144,
    baseUrl: 'https://noblemtl.com/',
    name: 'Noble Machine translations',
    iconUrl:
      'https://i1.wp.com/noblemtl.com/wp-content/uploads/2022/07/cropped-Noble-192x192.png',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new WPMangaStreamParser({
    id: 145,
    baseUrl: 'https://genesistls.com/',
    name: 'Genesis Translations',
    iconUrl: 'https://genesistls.com/wp-content/uploads/2022/04/logo.png',
    lang: 'en',
  }),
);

SourceFactory.registerSource(
  new WPMangaStreamParser({
    id: 146,
    baseUrl: 'https://knoxt.space/',
    name: 'KnoxT',
    iconUrl: 'https://knoxt.space/wp-content/uploads/2021/06/knoxtlight.jpg',
    lang: 'en',
  }),
);

export default SourceFactory;
