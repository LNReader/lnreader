import ComradeMaoScraper from "./en/comrademao";
import ReadLightNovelScraper from "./en/readlightnovel";
import BoxNovelScraper from "./en/boxnovel";
import fastNovelScraper from "./en/fastnovel";
import readNovelFullScraper from "./en/readnovelfull";
import mtlNovelScraper from "./en/mtlnovel";
import novelhallScraper from "./en/novelhall";
import WuxiaWorldScraper from "./en/wuxiaworld";
import novelFullScraper from "./en/novelfull";
import novelTrenchScraper from "./en/noveltrench";
import vipNovelScraper from "./en/vipnovel";
import kissLightNovelScraper from "./en/kisslightnovels";
import WuxiaWorldSiteScraper from "./en/wuxiaworldsite";
import FreeWebNovelScraper from "./en/freewebnovel";
import JPMTLScraper from "./en/jpmtl";
import lightNovelPubScraper from "./en/lightnovelpub";
import WuxiaWorldCoScraper from "./en/wuxiaworldco";
import novelUpdatesCcScraper from "./en/novelupdatescc";
import readLightNovelCcScraper from "./en/readlightnovelcc";
import tapReadScraper from "./en/tapread";
import WuxiaWorldCloudScraper from "./en/wuxiaworldcloud";
import WoopReadScraper from "./en/woopread";
import FoxaHolicScraper from "./en/foxaholic";
import EinharjarProjectScraper from "./es/einherjarproject";
import TuNovelaLigeraScraper from "./es/tunovelaligera";
import SkyNovelsScraper from "./es/skynovels";
import NovelasLigeraScraper from "./es/novelasligera";
import YuukiTlsScraper from "./es/yuukitls";
import NovelaWuxiaScraper from "./es/novelawuxia";
import OasisTranslationsScraper from "./es/oasistranslations";
import HasuTlScraper from "./es/hasutl";
import NovelPassionScraper from "./en/novelpassion";
import RoyalRoadScraper from "./en/royalroad";
import ScribbleHubScraper from "./en/scribblehub";
import SyosetuScraper from "./jp/syosetu";
import LNMTLScraper from "./en/lnmtl";
import {
    DaoNovelScraper,
    FirstKissNovelScraper,
    FreeNovelScraper,
    LunarLettersScraper,
    NovelCakeScraper,
    NovelsRockScraper,
    NovelTranslateScraper,
    SkyNovelScraper,
    SleepyTranslationsScraper,
    ZinnNovelScraper,
} from "./multisrc/madara/MadaraGenerator";
import WuxiaBlogScraper from "./en/wuxiablog";
import WuxiaCityScraper from "./en/wuxiacity";
import NovelUpdatesScraper from "./en/novelupdates";
import RanobesScraper from "./en/ranobes";
import YushuboScraper from "./ch/yushubo";

export const sources = [
    /**
     * English
     */
    {
        sourceId: 50,
        sourceUrl: "https://www.novelupdates.com/",
        sourceName: "Novel Updates",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/novelupdates/icon.png?raw=true",
        lang: "English",
    },
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
        sourceId: 3,
        url: "https://fastnovel.net/",
        sourceName: "FastNovel",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/fastnovel/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 4,
        url: "https://readnovelfull.com/",
        sourceName: "ReadNovelFull",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/readnovelfull/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 5,
        url: "https://www.mtlnovel.com/",
        sourceName: "MTLNovel",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/mtlnovel/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 6,
        url: "https://www.novelhall.com/",
        sourceName: "NovelHall",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/novelhall/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 7,
        url: "https://www.wuxiaworld.com/",
        sourceName: "WuxiaWorld",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/wuxiaworld/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 8,
        url: "https://novelfull.com/",
        sourceName: "NovelFull",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/novelfull/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 9,
        url: "https://noveltrench.com/",
        sourceName: "NovelTrench",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/noveltrench/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 10,
        url: "https://vipnovel.com/",
        sourceName: "VipNovel",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/vipnovel/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 11,
        url: "https://kisslightnovels.info/",
        sourceName: "KissLightNovels",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/kisslightnovels/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 12,
        url: "https://wuxiaworldsite.co/",
        sourceName: "WuxiaWorldSite",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/wuxiaworldsite/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 13,
        url: "https://freewebnovel.com/",
        sourceName: "FreeWebNovel",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/freewebnovel/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 14,
        url: "https://jpmtl.com/",
        sourceName: "JPMTL",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/jpmtl/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 15,
        url: "https://www.lightnovelpub.com/",
        sourceName: "LightNovelPub",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/lightnovelpub/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 16,
        url: "https://www.wuxiaworld.co/",
        sourceName: "WuxiaWorld.co",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/wuxiaworldco/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 17,
        url: "http://www.tapread.com/",
        sourceName: "TapRead",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/tapread/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 18,
        url: "https://www.novelupdates.cc/",
        sourceName: "NovelUpdates.cc",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/novelupdatescc/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 19,
        url: "https://m.readlightnovel.cc/",
        sourceName: "ReadLightNovel.cc",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/readlightnovelcc/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 20,
        url: "http://wuxiaworld.cloud/",
        sourceName: "WuxiaWorld.cloud",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/wuxiaworldcloud/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 21,
        url: "https://woopread.com/",
        sourceName: "WoopRead",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/woopread/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 22,
        url: "https://foxaholic.com/",
        sourceName: "Foxaholic",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/foxaholic/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 27,
        url: "https://comrademao.com/",
        sourceName: "ComradeMao",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/comrademao/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 33,
        url: "https://www.novelpassion.com/",
        sourceName: "NovelPassion",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/novelpassion/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 34,
        url: "https://www.royalroad.com/",
        sourceName: "Royal Road",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/royalroad/icon.png?raw=true",
        lang: "English",
    },

    {
        sourceId: 35,
        url: "https://www.scribblehub.com/",
        sourceName: "Scribble Hub",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/scribblehub/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 37,
        url: "https://lnmtl.com/",
        sourceName: "LNMTL",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/lnmtl/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 38,
        sourceUrl: "https://skynovel.org/",
        sourceName: "SkyNovel",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/multisrc/madara/icons/skynovel.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 39,
        sourceUrl: "https://novelcake.com/",
        sourceName: "NovelCake",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/multisrc/madara/icons/novelcake.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 40,
        sourceUrl: "https://novelsrock.com/",
        sourceName: "NovelsRock",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/multisrc/madara/icons/novelsrock.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 41,
        sourceUrl: "https://zinnovel.com/",
        sourceName: "ZinnNovel",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/multisrc/madara/icons/zinnovel.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 42,
        sourceUrl: "https://noveltranslate.com/",
        sourceName: "NovelTranslate",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/multisrc/madara/icons/noveltranslate.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 43,
        sourceUrl: "https://www.lunarletters.com/",
        sourceName: "LunarLetters",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/multisrc/madara/icons/lunarletters.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 44,
        sourceUrl: "https://sleepytranslations.com/",
        sourceName: "SleepyTranslations",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/multisrc/madara/icons/sleepytranslations.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 45,
        sourceUrl: "https://freenovel.me/",
        sourceName: "FreeNovelMe",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/multisrc/madara/icons/freenovel.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 46,
        sourceUrl: "https://1stkissnovel.love/",
        sourceName: "1stKissNovel",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/multisrc/madara/icons/1stkissnovel.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 47,
        sourceUrl: "https://daonovel.com/",
        sourceName: "DaoNovel",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/multisrc/madara/icons/daonovel.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 48,
        sourceUrl: "https://www.wuxia.blog/",
        sourceName: "Wuxia.Blog",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/wuxiablog/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 49,
        sourceUrl: "https://wuxia.city/",
        sourceName: "Wuxia.City",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/wuxiacity/icon.png?raw=true",
        lang: "English",
    },
    {
        sourceId: 51,
        sourceUrl: "https://ranobes.net/",
        sourceName: "Ranobes",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/en/ranobes/icon.png?raw=true",
        lang: "English",
    },

    /**
     * Spanish
     */

    {
        sourceId: 23,
        url: "https://tunovelaligera.com/",
        sourceName: "Tunovelaligera",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/es/tunovelaligera/icon.png?raw=true",
        lang: "Spanish",
    },
    {
        sourceId: 24,
        url: "https://www.skynovels.net/",
        sourceName: "SkyNovels",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/es/skynovels/icon.png?raw=true",
        lang: "Spanish",
    },
    {
        sourceId: 25,
        url: "https://einherjarproject.net/",
        sourceName: "EinherjarProject",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/es/einherjarproject/icon.png?raw=true",
        lang: "Spanish",
    },
    {
        sourceId: 26,
        url: "https://novelasligera.com/",
        sourceName: "NovelasLigera",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/es/novelasligera/icon.png?raw=true",
        lang: "Spanish",
    },
    {
        sourceId: 28,
        url: "https://yuukitls.com/",
        sourceName: "YuukiTls",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/es/yuukitls/icon.png?raw=true",
        lang: "Spanish",
    },
    {
        sourceId: 29,
        url: "https://hasutl.wordpress.com/",
        sourceName: "Hasu Translations",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/es/hasutl/icon.png?raw=true",
        lang: "Spanish",
    },
    {
        sourceId: 30,
        url: "https://oasistranslations.wordpress.com/",
        sourceName: "Oasis Translations",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/es/oasistranslations/icon.png?raw=true",
        lang: "Spanish",
    },
    {
        sourceId: 31,
        url: "http://www.novelawuxia.com/",
        sourceName: "Novela Wuxia",
        icon: "https://github.com/rajarsheechatterjee/lnreader-extensions/blob/main/src/es/novelawuxia/icon.png?raw=true",
        lang: "Spanish",
    },

    /**
     * Japanese
     */
    {
        sourceId: 36,
        url: "https://syosetu.com",
        sourceName: "Syosetu",
        icon: "https://github.com/skillgg/lnreader-sources/blob/main/src/jp/syosetu/icon.png?raw=true",
        lang: "Japanese",
    },

    /**
     * Chinese
     */
     {
        sourceId: 52,
        url: "https://m.yushubo.com",
        sourceName: "Yushubo",
        icon: "https://github.com/LNReader/lnreader-sources/blob/main/src/ch/yushubo/icon.png?raw=true",
        lang: "Chinese",
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
        case 3: {
            return fastNovelScraper;
        }
        case 4: {
            return readNovelFullScraper;
        }
        case 5: {
            return mtlNovelScraper;
        }
        case 6: {
            return novelhallScraper;
        }
        case 7: {
            return WuxiaWorldScraper;
        }
        case 8: {
            return novelFullScraper;
        }
        case 9: {
            return novelTrenchScraper;
        }
        case 10: {
            return vipNovelScraper;
        }
        case 11: {
            return kissLightNovelScraper;
        }
        case 12: {
            return WuxiaWorldSiteScraper;
        }
        case 13: {
            return FreeWebNovelScraper;
        }
        case 14: {
            return JPMTLScraper;
        }
        case 15: {
            return lightNovelPubScraper;
        }
        case 16: {
            return WuxiaWorldCoScraper;
        }
        case 17: {
            return tapReadScraper;
        }
        case 18: {
            return novelUpdatesCcScraper;
        }
        case 19: {
            return readLightNovelCcScraper;
        }
        case 20: {
            return WuxiaWorldCloudScraper;
        }
        case 21: {
            return WoopReadScraper;
        }
        case 22: {
            return FoxaHolicScraper;
        }
        case 23: {
            return TuNovelaLigeraScraper;
        }
        case 24: {
            return SkyNovelsScraper;
        }
        case 25: {
            return EinharjarProjectScraper;
        }
        case 26: {
            return NovelasLigeraScraper;
        }
        case 27: {
            return ComradeMaoScraper;
        }
        case 28: {
            return YuukiTlsScraper;
        }
        case 29: {
            return HasuTlScraper;
        }
        case 30: {
            return OasisTranslationsScraper;
        }
        case 31: {
            return NovelaWuxiaScraper;
        }
        case 33: {
            return NovelPassionScraper;
        }
        case 34: {
            return RoyalRoadScraper;
        }
        case 35: {
            return ScribbleHubScraper;
        }
        case 36: {
            return SyosetuScraper;
        }
        case 37: {
            return LNMTLScraper;
        }
        case 38: {
            return SkyNovelScraper;
        }
        case 39: {
            return NovelCakeScraper;
        }
        case 40: {
            return NovelsRockScraper;
        }
        case 41: {
            return ZinnNovelScraper;
        }
        case 42: {
            return NovelTranslateScraper;
        }
        case 43: {
            return LunarLettersScraper;
        }
        case 44: {
            return SleepyTranslationsScraper;
        }
        case 45: {
            return FreeNovelScraper;
        }
        case 46: {
            return FirstKissNovelScraper;
        }
        case 47: {
            return DaoNovelScraper;
        }
        case 48: {
            return WuxiaBlogScraper;
        }
        case 49: {
            return WuxiaCityScraper;
        }
        case 50: {
            return NovelUpdatesScraper;
        }
        case 51: {
            return RanobesScraper;
        }
        case 52: {
            return YushuboScraper;
        }
    }
};
