// references:
// https://en.wikipedia.org/wiki/IETF_language_tag
// https://en.wikipedia.org/wiki/List_of_language_names

export const languages = {
  Arabic: 'العربية',
  Chinese: '中文, 汉语, 漢語',
  English: 'English',
  French: 'Français',
  Indonesian: 'Bahasa Indonesia',
  Japanese: '日本語',
  Korean: '조선말, 한국어',
  Polish: 'Polski',
  Portuguese: 'Português',
  Russian: 'Русский',
  Spanish: 'Español',
  Turkish: 'Türkçe',
  Ukrainian: 'Українська',
  Vietnamese: 'Tiếng Việt',
} as const;

export type Language = keyof typeof languages;
export type NativeLanguage = (typeof languages)[Language];

export const languagesMapping: Record<string, Language | undefined> = {
  'ab': 'Arabic',
  'zh': 'Chinese',
  'en': 'English',
  'fr': 'French',
  'id': 'Indonesian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'es': 'Spanish',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'vi': 'Vietnamese',
};

export const availableLanguages = Object.keys(languages) as Language[];
