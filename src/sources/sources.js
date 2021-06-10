import ComradeMaoScraper from "./en/comrademao";
import ReadLightNovelScraper from "./en/readlightnovel";
import BoxNovelScraper from "./en/boxnovel";

export const sources = [
    {
        sourceId: 1,
        url: "https://boxnovel.com/",
        sourceName: "BoxNovel",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/boxnovel/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 2,
        sourceName: "ReadLightNovel",
        url: "https://www.readlightnovel.org",
        lang: "English",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/readlightnovel/icon.png?raw=true",
    },
    {
        sourceId: 27,
        url: "https://comrademao.com/",
        sourceName: "ComradeMao",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/comrademao/icon.png?raw=true",
        lang: "English",
    },
];

export const getSource = (sourceId) => {
    switch (sourceId) {
        case 1: {
            return BoxNovelScraper;
        }
        case 2: {
            return ReadLightNovelScraper;
        }
        case 27: {
            return ComradeMaoScraper;
        }
    }
};
