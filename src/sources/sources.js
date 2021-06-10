import ReadLightNovelScraper from "./en/readlightnovel";

export const sources = [
    {
        sourceId: 2,
        sourceName: "ReadLightNovel",
        url: "https://www.readlightnovel.org",
        lang: "English",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/readlightnovel/icon.png?raw=true",
    },
];

export const getSource = (sourceId) => {
    switch (sourceId) {
        case 2: {
            return ReadLightNovelScraper;
        }
    }
};
