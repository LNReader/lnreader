import * as Localization from 'expo-localization';
import * as dayjs from 'dayjs';
import i18n from 'i18n-js';

import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
dayjs.extend(customParseFormat);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(calendar);

import 'dayjs/locale/ar';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/ja';
import 'dayjs/locale/pt';
import 'dayjs/locale/ru';
import 'dayjs/locale/tr';
import 'dayjs/locale/uk';
import 'dayjs/locale/vi';
import 'dayjs/locale/zh';

import ar from './languages/ar_SA/strings.json';
import de from './languages/de_DE/strings.json';
import en from './languages/en/strings.json';
import es from './languages/es_ES/strings.json';
import fr from './languages/fr_FR/strings.json';
import it from './languages/it_IT/strings.json';
import ja from './languages/ja_JP/strings.json';
import pt from './languages/pt_PT/strings.json';
import ptBr from './languages/pt_BR/strings.json';
import ru from './languages/ru_RU/strings.json';
import tr from './languages/tr_TR/strings.json';
import uk from './languages/uk_UA/strings.json';
import vi from './languages/vi_VN/strings.json';
import zhCn from './languages/zh_CN/strings.json';
import zhTw from './languages/zh_TW/strings.json';

import { StringMap } from './types';

i18n.fallbacks = true;
i18n.translations = {
  ar,
  de,
  en,
  es,
  fr,
  it,
  ja,
  pt,
  'pt-BR': ptBr,
  ru,
  tr,
  uk,
  vi,
  'zh-CN': zhCn,
  'zh-TW': zhTw,
};
i18n.locale = Localization.locale;
dayjs.locale(Localization.locale);

export const localization = Localization.locale;
export const getString = (
  stringKey: keyof StringMap,
  options?: i18n.TranslateOptions,
) => i18n.t(stringKey, options);

dayjs.Ls[dayjs.locale()].calendar = {
  sameDay: getString('date.calendar.sameDay'),
  nextDay: getString('date.calendar.nextDay'),
  nextWeek: 'dddd',
  lastDay: getString('date.calendar.lastDay'),
  lastWeek: getString('date.calendar.lastWeek'),
  sameElse: 'LL',
};
