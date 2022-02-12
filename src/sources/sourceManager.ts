import {
  ArMTLScraper,
  BoxNovelOnlineScraper,
  BoxNovelScraper,
  ClickNovelScraper,
  DaoNovelScraper,
  FirstKissNovelScraper,
  FreeNovelScraper,
  HizoMangaScraper,
  LatestNovelScraper,
  LightNovelHeavenScraper,
  LightNovelsHubScraper,
  LunarLettersScraper,
  MeionNovelScraper,
  MoreNovelScraper,
  MostNovelScraper,
  MysticalSeriesScraper,
  Novel4UpScraper,
  NovelCakeScraper,
  NovelMultiverseScraper,
  NovelsRockScraper,
  NovelTranslateScraper,
  OnlyMTLScraper,
  ReadWebNovelsScraper,
  SkyNovelScraper,
  SleepyTranslationsScraper,
  WBNovelScraper,
  WebNovelLoverScraper,
  WuxiaWorldDotSiteScraper,
  ZinnNovelScraper,
} from './multisrc/madara/MadaraGenerator';
import {KolNovelScraper} from './multisrc/wpmangastream/WPMangaStreamGenerator';
import {
  LtnovelScraper,
  NovelmtScraper,
  ReadwnScraper,
} from './multisrc/readwn/ReadwnGenerator';

import {SourceNovelItem, SourceNovel, SourceChapter} from './types';
import ReadLightNovelScraper from './en/readlightnovel/readlightnovel';
import fastNovelScraper from './en/fastnovel/fastnovel';
import readNovelFullScraper from './en/readnovelfull/readnovelfull';
import ArNovelScraper from './ar/arnovel/arnovel';
import RewayatArScraper from './ar/rewayatar/rewayatar';
import RiwayatScraper from './ar/riwayat/riwayat';
import ArthurScansScraper from './br/ArthurScans/ArthurScans';
import ReaperScansBrScraper from './br/ReaperScansBr/ReaperScansBr';
import YushuboScraper from './ch/yushubo/yushubo';
import BestLightNovel from './en/bestlightnovel/bestlightnovel';
import ComradeMaoScraper from './en/comrademao/comrademao';
import DivineDaoLibraryScraper from './en/divinedaolibrary/divinedaolibrary';
import FoxaHolicScraper from './en/foxaholic/foxaholic';
import FreeWebNovelScraper from './en/freewebnovel/freewebnovel';
import JPMTLScraper from './en/jpmtl/jpmtl';
import kissLightNovelScraper from './en/kisslightnovels/kisslightnovels';
import lightNovelPubScraper from './en/lightnovelpub/lightnovelpub';
import LightNovelUpdatesScraper from './en/lightnovelupdates/lightnovelupdates';
import LNMTLScraper from './en/lnmtl/lnmtl';
import MTLCornerScraper from './en/mtlcorner/mtlcorner';
import mtlNovelScraper from './en/mtlnovel/mtlnovel';
import MTLReaderScraper from './en/mtlreader/mtlreader';
import MyLoveNovelScraper from './en/mylovenovel/mylovenovel';
import NitroScansScraper from './en/nitroscans/nitroscans';
import NovelForestScraper from './en/novelforest/novelforest';
import novelFullScraper from './en/novelfull/novelfull';
import NovelFullMeScraper from './en/NovelFullMe/NovelFullMe';
import novelhallScraper from './en/novelhall/novelhall';
import NovelOnlineFullScraper from './en/novelonlinefull/novelonlinefull';
import NovelPassionScraper from './en/novelpassion/novelpassion';
import NovelPubScraper from './en/novelpub/novelpub';
import novelTrenchScraper from './en/noveltrench/noveltrench';
import NovelUpdatesScraper from './en/novelupdates/novelupdates';
import novelUpdatesCcScraper from './en/novelupdatescc/novelupdatescc';
import RainOfSnowScraper from './en/rainofsnow/rainofsnow';
import RanobesScraper from './en/ranobes/ranobes';
import readLightNovelCcScraper from './en/readlightnovelcc/readlightnovelcc';
import ReaperScansScraper from './en/reaperscans/reaperscans';
import RoyalRoadScraper from './en/royalroad/royalroad';
import ScribbleHubScraper from './en/scribblehub/scribblehub';
import tapReadScraper from './en/tapread/tapread';
import TravisTranslationsScraper from './en/travistranslations/travistranslations';
import vipNovelScraper from './en/vipnovel/vipnovel';
import WLNUpdatesScraper from './en/wlnupdates/wlnupdates';
import WoopReadScraper from './en/woopread/woopread';
import WuxiaBlogScraper from './en/wuxiablog/wuxiablog';
import WuxiaCityScraper from './en/wuxiacity/wuxiacity';
import WuxiaWorldScraper from './en/wuxiaworld/wuxiaworld';
import WuxiaWorldCloudScraper from './en/wuxiaworldcloud/wuxiaworldcloud';
import WuxiaWorldCoScraper from './en/wuxiaworldco/wuxiaworldco';
import WuxiaWorldSiteScraper from './en/wuxiaworldsite/wuxiaworldsite';
import EinharjarProjectScraper from './es/einherjarproject/einherjarproject';
import HasuTlScraper from './es/hasutl/hasutl';
import NovelasLigeraScraper from './es/novelasligera/novelasligera';
import NovelaWuxiaScraper from './es/novelawuxia/novelawuxia';
import OasisTranslationsScraper from './es/oasistranslations/oasistranslations';
import SkyNovelsScraper from './es/skynovels/skynovels';
import TuNovelaLigeraScraper from './es/tunovelaligera/tunovelaligera';
import YuukiTlsScraper from './es/yuukitls/yuukitls';
import ChireadsScraper from './fr/chireads/chireads';
import NovelDeGlaceScraper from './fr/noveldeglace/noveldeglace';
import IdMtlNovelScraper from './id/idmtlnovel/idmtlnovel';
import IndoWebNovelScraper from './id/indowebnovel/indowebnovel';
import NovelRinganScraper from './id/novelringan/novelringan';
import SakuraNovelScraper from './id/sakuranovel/sakuranovel';
import SyosetuScraper from './jp/syosetu/syosetu';
import RanobeHubScraper from './ru/ranobehub/ranobehub';
import RanobeLibScraper from './ru/ranobelib/ranobelib';
import EpikNovelScraper from './tr/epiknovel/epiknovel';

interface PopularNovelsResponse {
  totalPages: number;
  novels: SourceNovelItem[];
}

interface Scraper {
  popularNovels: (pageNo: number) => Promise<PopularNovelsResponse>;
  parseNovelAndChapters: (novelUrl: string) => Promise<SourceNovel>;
  parseChapter: (
    novelUrl: string,
    chapterUrl: string,
  ) => Promise<SourceChapter>;
  searchNovels: (searchTerm: string) => Promise<SourceNovelItem[]>;
}

export const sourceManager = (sourceId: number): Scraper => {
  const scrapers: Record<number, Scraper> = {
    1: BoxNovelScraper,
    2: ReadLightNovelScraper,
    3: fastNovelScraper,
    4: readNovelFullScraper,
    5: mtlNovelScraper,
    6: novelhallScraper,
    7: WuxiaWorldScraper,
    8: novelFullScraper,
    9: novelTrenchScraper,
    10: vipNovelScraper,
    11: kissLightNovelScraper,
    12: WuxiaWorldSiteScraper,
    13: FreeWebNovelScraper,
    14: JPMTLScraper,
    15: lightNovelPubScraper,
    16: WuxiaWorldCoScraper,
    17: tapReadScraper,
    18: novelUpdatesCcScraper,
    19: readLightNovelCcScraper,
    20: WuxiaWorldCloudScraper,
    21: WoopReadScraper,
    22: FoxaHolicScraper,
    23: TuNovelaLigeraScraper,
    24: SkyNovelsScraper,
    25: EinharjarProjectScraper,
    26: NovelasLigeraScraper,
    27: ComradeMaoScraper,
    28: YuukiTlsScraper,
    29: HasuTlScraper,
    30: OasisTranslationsScraper,
    31: NovelaWuxiaScraper,
    33: NovelPassionScraper,
    34: RoyalRoadScraper,
    35: ScribbleHubScraper,
    36: SyosetuScraper,
    37: LNMTLScraper,
    38: SkyNovelScraper,
    39: NovelCakeScraper,
    40: NovelsRockScraper,
    41: ZinnNovelScraper,
    42: NovelTranslateScraper,
    43: LunarLettersScraper,
    44: SleepyTranslationsScraper,
    45: FreeNovelScraper,
    46: FirstKissNovelScraper,
    47: DaoNovelScraper,
    48: WuxiaBlogScraper,
    49: WuxiaCityScraper,
    50: NovelUpdatesScraper,
    51: RanobesScraper,
    52: YushuboScraper,
    53: KolNovelScraper,
    54: RewayatArScraper,
    55: MostNovelScraper,
    56: NovelMultiverseScraper,
    57: LightNovelHeavenScraper,
    58: LightNovelsHubScraper,
    59: ArNovelScraper,
    60: MeionNovelScraper,
    61: WebNovelLoverScraper,
    62: WLNUpdatesScraper,
    63: BoxNovelOnlineScraper,
    64: ClickNovelScraper,
    65: ReadWebNovelsScraper,
    66: WBNovelScraper,
    67: ReaperScansScraper,
    68: ReadwnScraper,
    69: RanobeHubScraper,
    70: DivineDaoLibraryScraper,
    71: NovelOnlineFullScraper,
    72: LightNovelUpdatesScraper,
    73: EpikNovelScraper,
    74: WuxiaWorldDotSiteScraper,
    75: MysticalSeriesScraper,
    76: TravisTranslationsScraper,
    77: NovelDeGlaceScraper,
    78: RainOfSnowScraper,
    79: ReaperScansBrScraper,
    80: ArthurScansScraper,
    81: IdMtlNovelScraper,
    82: MTLReaderScraper,
    83: MyLoveNovelScraper,
    84: MoreNovelScraper,
    85: RiwayatScraper,
    86: NovelRinganScraper,
    87: IndoWebNovelScraper,
    88: ChireadsScraper,
    89: MTLCornerScraper,
    90: NitroScansScraper,
    91: OnlyMTLScraper,
    92: NovelForestScraper,
    93: RanobeLibScraper,
    94: NovelPubScraper,
    95: BestLightNovel,
    96: HizoMangaScraper,
    97: NovelFullMeScraper,
    98: LatestNovelScraper,
    99: NovelmtScraper,
    100: LtnovelScraper,
    101: ArMTLScraper,
    103: SakuraNovelScraper,
    104: Novel4UpScraper,
  };

  return scrapers[sourceId];
};
