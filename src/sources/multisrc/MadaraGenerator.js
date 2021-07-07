import MadaraScraper from "./madara/MadaraScraper";

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
