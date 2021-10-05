import ComradeMaoScraper from './en/comrademao';
import ReadLightNovelScraper from './en/readlightnovel';
import BoxNovelScraper from './en/boxnovel';
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
  BoxNovelOnlineScraper,
  ClickNovelScraper,
  DaoNovelScraper,
  FirstKissNovelScraper,
  FreeNovelScraper,
  LightNovelHeavenScraper,
  LightNovelsHubScraper,
  LunarLettersScraper,
  MeionNovelScraper,
  MostNovelScraper,
  MysticalSeriesScraper,
  NovelCakeScraper,
  NovelMultiverseScraper,
  NovelsRockScraper,
  NovelTranslateScraper,
  ReadWebNovelsScraper,
  SkyNovelScraper,
  SleepyTranslationsScraper,
  WBNovelScraper,
  WebNovelLoverScraper,
  WoopReadScraper,
  WuxiaWorldDotSiteScraper,
  ZinnNovelScraper,
} from './multisrc/madara/MadaraGenerator';
import WuxiaBlogScraper from './en/wuxiablog';
import WuxiaCityScraper from './en/wuxiacity';
import NovelUpdatesScraper from './en/novelupdates';
import RanobesScraper from './en/ranobes';
import YushuboScraper from './ch/yushubo';
import {
  KolNovelScraper,
  RewayatArScraper,
} from './multisrc/wpmangastream/WPMangaStreamGenerator';
import WLNUpdatesScraper from './en/wlnupdates';
import ReaperScansScraper from './en/reaperscans';
import ReadwnScraper from './en/readwn';
import RanobeHubScraper from './ru/ranobehub';
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

export const getSource = sourceId => {
  const scrapers = {
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
  };

  return scrapers[sourceId];
};
