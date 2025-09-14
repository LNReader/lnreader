import * as Localization from 'expo-localization';
import dayjs from 'dayjs';
import { I18n, TranslateOptions } from 'i18n-js';

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

const i18n = new I18n({
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
});
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

const detectedLocale = Localization.getLocales()[0].languageTag;

console.log('--- i18n DEBUG START ---');
console.log('Raw Localization.locale:', detectedLocale);

// Safely provide a fallback if detectedLocale
// Else it will lead to a crash
const activeLocale =
  detectedLocale && detectedLocale.length > 0
    ? detectedLocale
    : i18n.defaultLocale; // Fallback to 'en' if detection fails

console.log('Resolved activeLocale for i18n/dayjs:', activeLocale);
console.log('--- i18n DEBUG END ---');

i18n.locale = activeLocale;
dayjs.locale(activeLocale);

export const localization = activeLocale;
export const getString = (
  stringKey: keyof StringMap,
  options?: TranslateOptions,
) => i18n.t(stringKey, options);

// @ts-expect-error
dayjs.Ls[dayjs.locale()].calendar = {
  sameDay: getString('date.calendar.sameDay'),
  nextDay: getString('date.calendar.nextDay'),
  nextWeek: 'dddd',
  lastDay: getString('date.calendar.lastDay'),
  lastWeek: getString('date.calendar.lastWeek'),
  sameElse: 'LL',
};
