import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

import en from './languages/en/en.json';
import es from './languages/es/es.json';
import tr from './languages/tr/tr.json';

import { StringMap } from './types';

i18n.fallbacks = true;
i18n.translations = { en, es, tr };
i18n.locale = Localization.locale;

export const getString = (stringKey: keyof StringMap) => i18n.t(stringKey);
