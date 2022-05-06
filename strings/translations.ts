import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

import en from './languages/en/strings.json';
import es from './languages/es/strings.json';
import tr from './languages/tr/strings.json';
import ru from './languages/ru/strings.json';
import ar from './languages/ar/strings.json';
import uk from './languages/uk/strings.json';
import pt from './languages/pt/strings.json';

import { StringMap } from './types';

i18n.fallbacks = true;
i18n.translations = { en, es, tr, ru, ar, uk, pt };
i18n.locale = Localization.locale;

export const getString = (stringKey: keyof StringMap) => i18n.t(stringKey);
