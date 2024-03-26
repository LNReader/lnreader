// references:
// https://en.wikipedia.org/wiki/IETF_language_tag
// https://en.wikipedia.org/wiki/List_of_language_names

export const languagesMapping: Record<string, string> = {
  'ab': 'العربية',
  'zh': '中文, 汉语, 漢語',
  'en': 'English',
  'fr': 'Français',
  'id': 'Bahasa Indonesia',
  'ja': '日本語',
  'ko': '조선말, 한국어',
  'pl': 'Polski',
  'pt': 'Português',
  'ru': 'Русский',
  'es': 'Español',
  'th': 'ไทย',
  'tr': 'Türkçe',
  'uk': 'Українська',
  'vi': 'Tiếng Việt',
};

export const languages = Object.values(languagesMapping);
