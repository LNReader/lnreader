import * as Localization from 'expo-localization';
import * as dayjs from 'dayjs';
import i18n from 'i18n-js';

import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(calendar);

import 'dayjs/locale/es';
import 'dayjs/locale/tr';
import 'dayjs/locale/ru';
import 'dayjs/locale/ar';
import 'dayjs/locale/uk';
import 'dayjs/locale/pt';
import 'dayjs/locale/de';
import 'dayjs/locale/it';
import 'dayjs/locale/zh';

import en from './languages/en/strings.json';
import es from './languages/es/strings.json';
import tr from './languages/tr/strings.json';
import ru from './languages/ru/strings.json';
import ar from './languages/ar/strings.json';
import uk from './languages/uk/strings.json';
import pt from './languages/pt/strings.json';
import de from './languages/de/strings.json';
import it from './languages/it/strings.json';
import zh from './languages/zh/strings.json';

import { StringMap } from './types';

i18n.fallbacks = true;
i18n.translations = { en, es, tr, ru, ar, uk, pt, de, it, zh };
i18n.locale = Localization.locale;
dayjs.locale(Localization.locale);

export const getString = (stringKey: keyof StringMap) => i18n.t(stringKey);

dayjs.Ls[dayjs.locale()].calendar = {
  sameDay: getString('date.calendar.sameDay'),
  nextDay: getString('date.calendar.nextDay'),
  nextWeek: 'dddd',
  lastDay: getString('date.calendar.lastDay'),
  lastWeek: getString('date.calendar.lastWeek'),
  sameElse: 'LL',
};
