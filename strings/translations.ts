import * as Localization from 'expo-localization';
import moment from 'moment';
import i18n from 'i18n-js';

import 'moment/locale/es';
import 'moment/locale/tr';
import 'moment/locale/ru';
import 'moment/locale/ar';
import 'moment/locale/uk';
import 'moment/locale/pt';
import 'moment/locale/de';
import 'moment/locale/it';

import en from './languages/en/strings.json';
import es from './languages/es/strings.json';
import tr from './languages/tr/strings.json';
import ru from './languages/ru/strings.json';
import ar from './languages/ar/strings.json';
import uk from './languages/uk/strings.json';
import pt from './languages/pt/strings.json';
import de from './languages/de/strings.json';
import it from './languages/it/strings.json';

import { StringMap } from './types';

i18n.fallbacks = true;
i18n.translations = { en, es, tr, ru, ar, uk, pt, de, it };
i18n.locale = Localization.locale;
moment.locale(Localization.locale);

export const getString = (stringKey: keyof StringMap) => i18n.t(stringKey);
