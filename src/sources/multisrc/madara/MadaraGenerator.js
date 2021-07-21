import MadaraScraper from "./MadaraScraper";

const getPath = (extensionId) => {
    const path = {
        38: { novels: "manga", novel: "manga", chapter: "manga" },
        39: { novels: "series", novel: "series", chapter: "series" },
        40: { novels: "novels", novel: "novel", chapter: "novel" },
        41: { novels: "manga", novel: "manga", chapter: "manga" },
        42: { novels: "all-novels", novel: "manga", chapter: "manga" },
        43: { novels: "series", novel: "series", chapter: "series" },
        44: { novels: "series", novel: "series", chapter: "series" },
        45: { novels: "novel", novel: "novel", chapter: "novel" },
        46: { novels: "novel", novel: "novel", chapter: "novel" },
        47: { novels: "novel-list", novel: "novel", chapter: "novel" },
        55: { novels: "manga", novel: "manga", chapter: "manga" },
        56: { novels: "novel", novel: "novel", chapter: "novel" },
        57: { novels: "series", novel: "series", chapter: "series" },
        58: { novels: "novel", novel: "novel", chapter: "novel" },
        59: { novels: "novel", novel: "novel", chapter: "novel" },
        60: { novels: "novel", novel: "novel", chapter: "novel" },
        61: { novels: "novel", novel: "novel", chapter: "novel" },
        62: { novels: "novel", novel: "novel", chapter: "novel" },
        63: { novels: "novel", novel: "novel", chapter: "novel" },
    };

    return path[extensionId];
};

export const SkyNovelScraper = new MadaraScraper(
    38,
    "https://skynovel.org/",
    "SkyNovel",
    getPath(38)
);

export const NovelCakeScraper = new MadaraScraper(
    39,
    "https://novelcake.com/",
    "NovelCake",
    getPath(39)
);

export const NovelsRockScraper = new MadaraScraper(
    40,
    "https://novelsrock.com/",
    "NovelsRock",
    getPath(40)
);

export const ZinnNovelScraper = new MadaraScraper(
    41,
    "https://zinnovel.com/",
    "ZinnNovel",
    getPath(41)
);

export const NovelTranslateScraper = new MadaraScraper(
    42,
    "https://noveltranslate.com/",
    "NovelTranslate",
    getPath(42)
);

export const LunarLettersScraper = new MadaraScraper(
    43,
    "https://www.lunarletters.com/",
    "LunarLetters",
    getPath(43)
);

export const SleepyTranslationsScraper = new MadaraScraper(
    44,
    "https://sleepytranslations.com/",
    "SleepyTranslations",
    getPath(44)
);

export const FreeNovelScraper = new MadaraScraper(
    45,
    "https://freenovel.me/",
    "FreeNovelMe",
    getPath(45)
);

export const FirstKissNovelScraper = new MadaraScraper(
    46,
    "https://1stkissnovel.love/",
    "1stKissNovel",
    getPath(46)
);

export const DaoNovelScraper = new MadaraScraper(
    47,
    "https://daonovel.com/",
    "DaoNovel",
    getPath(47)
);

export const MostNovelScraper = new MadaraScraper(
    55,
    "https://mostnovel.com/",
    "MostNovel",
    getPath(55)
);

export const NovelMultiverseScraper = new MadaraScraper(
    56,
    "https://www.novelmultiverse.com/",
    "NovelMultiverse",
    getPath(56)
);

export const LightNovelHeavenScraper = new MadaraScraper(
    57,
    "https://lightnovelheaven.com/",
    "LightNovelHeaven",
    getPath(57)
);

export const LightNovelsHubScraper = new MadaraScraper(
    58,
    "https://lightnovelshub.com/",
    "LightNovelsHub",
    getPath(58)
);

export const ArNovelScraper = new MadaraScraper(
    59,
    "https://arnovel.me/",
    "ArNovel",
    getPath(59)
);

export const MeionNovelScraper = new MadaraScraper(
    60,
    "https://meionovel.id/",
    "MeionNovel",
    getPath(60)
);

export const WebNovelLoverScraper = new MadaraScraper(
    61,
    "https://www.webnovelover.com/",
    "WebNovelLover",
    getPath(61)
);
