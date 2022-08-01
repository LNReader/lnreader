import * as Localization from 'expo-localization';
import * as dayjs from 'dayjs';
import i18n from 'i18n-js';

import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(calendar);

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
