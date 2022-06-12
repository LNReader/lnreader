import ComradeMaoScraper from './en/comrademao';
import ReadLightNovelScraper from './en/readlightnovel';
import fastNovelScraper from './en/fastnovel';
import readNovelFullScraper from './en/readnovelfull';
import mtlNovelScraper from './en/mtlnovel';
import novelhallScraper from './en/novelhall';
import WuxiaWorldScraper from './en/wuxiaworld';
import novelFullScraper from './en/novelfull';
import novelTrenchScraper from './en/noveltrench';
import vipNovelScraper from './en/vipnovel';
import kissLightNovelScraper from './en/kisslightnovels';
import WuxiaWorldSiteScraper from './en/wuxiaworldsite';
import FreeWebNovelScraper from './en/freewebnovel';
import JPMTLScraper from './en/jpmtl';
import lightNovelPubScraper from './en/lightnovelpub';
import WuxiaWorldCoScraper from './en/wuxiaworldco';
import novelUpdatesCcScraper from './en/novelupdatescc';
import readLightNovelCcScraper from './en/readlightnovelcc';
import tapReadScraper from './en/tapread';
import WuxiaWorldCloudScraper from './en/wuxiaworldcloud';
import FoxaHolicScraper from './en/foxaholic';
import EinharjarProjectScraper from './es/einherjarproject';
import TuNovelaLigeraScraper from './es/tunovelaligera';
import SkyNovelsScraper from './es/skynovels';
import NovelasLigeraScraper from './es/novelasligera';
import YuukiTlsScraper from './es/yuukitls';
import NovelaWuxiaScraper from './es/novelawuxia';
import OasisTranslationsScraper from './es/oasistranslations';
import HasuTlScraper from './es/hasutl';
import NovelPassionScraper from './en/novelpassion';
import RoyalRoadScraper from './en/royalroad';
import ScribbleHubScraper from './en/scribblehub';
import SyosetuScraper from './jp/syosetu';
import LNMTLScraper from './en/lnmtl';
import {
  ArMTLScraper,
  BoxNovelScraper,
  ClickNovelScraper,
  DaoNovelScraper,
  FirstKissNovelScraper,
  HizoMangaScraper,
  LatestNovelScraper,
  LightNovelHeavenScraper,
  LightNovelsHubScraper,
  LunarLettersScraper,
  MoreNovelScraper,
  MostNovelScraper,
  MysticalSeriesScraper,
  Novel4UpScraper,
  TeamXNovelScraper,
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
  TurkceLightNovelsScraper,
  MeioNovelScraper,
  TipNovelScraper,
  FreeNovelMeScraper,
  NovelOwlScraper,
  SonicMTLScraper,
  MTLNovelDotClubScraper,
} from './multisrc/madara/MadaraGenerator';
import WuxiaBlogScraper from './en/wuxiablog';
import WuxiaCityScraper from './en/wuxiacity';
import NovelUpdatesScraper from './en/novelupdates';
import RanobesScraper from './en/ranobes';
import YushuboScraper from './ch/yushubo';
import {
  KolNovelScraper,
  LiebeSchneeHiverNovelScraper,
} from './multisrc/wpmangastream/WPMangaStreamGenerator';
import WLNUpdatesScraper from './en/wlnupdates';
import ReaperScansScraper from './en/reaperscans';
import JaomixScraper from './ru/jaomix';
import RanobeHubScraper from './ru/ranobehub';
import RanobeLibScraper from './ru/ranobelib';
import RanobeRFScraper from './ru/ranoberf';
import RenovelsScraper from './ru/renovels';
import RulateScraper from './ru/rulate';
import ArNovelScraper from './ar/arnovel';
import DivineDaoLibraryScraper from './en/divinedaolibrary';
import NovelOnlineFullScraper from './en/novelonlinefull';
import LightNovelUpdatesScraper from './en/lightnovelupdates';
import EpikNovelScraper from './tr/epiknovel';
import TravisTranslationsScraper from './en/travistranslations';
import NovelDeGlaceScraper from './fr/noveldeglace';
import RainOfSnowScraper from './en/rainofsnow';
import ReaperScansBrScraper from './br/ReaperScansBr';
import ArthurScansScraper from './br/ArthurScans';
import IdMtlNovelScraper from './id/idmtlnovel';
import WoopReadScraper from './en/woopread';
import MTLReaderScraper from './en/mtlreader';
import MyLoveNovelScraper from './en/mylovenovel';
import RiwayatScraper from './ar/riwayat';
import NovelRinganScraper from './id/novelringan';
import IndoWebNovelScraper from './id/indowebnovel';
import ChireadsScraper from './fr/chireads';
import MTLCornerScraper from './en/mtlcorner';
import NitroScansScraper from './en/nitroscans';
import NovelForestScraper from './en/novelforest';
import NovelPubScraper from './en/novelpub';
import BestLightNovel from './en/bestlightnovel';
import NovelFullMeScraper from './en/NovelFullMe';
import {
  LtnovelScraper,
  NovelmtScraper,
  ReadwnScraper,
} from './multisrc/readwn/ReadwnGenerator';
import SakuraNovelScraper from './id/sakuranovel';

import { SourceChapter, SourceNovel, SourceNovelItem } from './types';
import AllNovelFullScraper from './en/allnovelfull';
import ReadFreeNovelScraper from './en/readfreenovel';
import FreeNovelUpdatesScraper from './en/freenovelupdates';
import NovelsCafeScraper from './en/NovelsCafe';
import LightNovelReaderScraper from './en/LightNovelReader';
import HakoLightNovelScraper from './vi/HakoLightNovel';
import MTNovelScraper from './en/mtnovel';
import { SelectedFilter, SourceFilter } from './types/filterTypes';

interface PopularNovelsResponse {
  totalPages: number;
  novels: SourceNovelItem[];
}

export interface SourceOptions {
  showLatestNovels?: boolean;
  filters?: SelectedFilter;
}

interface Scraper {
  popularNovels: (
    pageNo: number,
    options?: SourceOptions,
  ) => Promise<PopularNovelsResponse>;
  parseNovelAndChapters: (novelUrl: string) => Promise<SourceNovel>;
  parseChapter: (
    novelUrl: string,
    chapterUrl: string,
  ) => Promise<SourceChapter>;
  searchNovels: (searchTerm: string) => Promise<SourceNovelItem[]>;
  filters?: SourceFilter[];
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
    45: FreeNovelMeScraper,
    46: FirstKissNovelScraper,
    47: DaoNovelScraper,
    48: WuxiaBlogScraper,
    49: WuxiaCityScraper,
    50: NovelUpdatesScraper,
    51: RanobesScraper,
    52: YushuboScraper,
    53: KolNovelScraper,
    55: MostNovelScraper,
    56: NovelMultiverseScraper,
    57: LightNovelHeavenScraper,
    58: LightNovelsHubScraper,
    59: ArNovelScraper,
    60: MeioNovelScraper,
    61: WebNovelLoverScraper,
    62: WLNUpdatesScraper,
    63: TipNovelScraper,
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
    107: TeamXNovelScraper,
    108: AllNovelFullScraper,
    109: ReadFreeNovelScraper,
    110: TurkceLightNovelsScraper,
    111: NovelOwlScraper,
    112: FreeNovelUpdatesScraper,
    113: NovelsCafeScraper,
    114: LightNovelReaderScraper,
    115: HakoLightNovelScraper,
    116: RenovelsScraper,
    117: JaomixScraper,
    118: RulateScraper,
    119: RanobeRFScraper,
    120: MTNovelScraper,
    121: SonicMTLScraper,
    122: MTLNovelDotClubScraper,
    123: LiebeSchneeHiverNovelScraper,
  };

  return scrapers[sourceId];
};
