//seacrh here https://pastebin.com/raw/ppdMS687

export enum Language {
  Arabic = 'العربية',
  Chinese = '中文, 汉语, 漢語',
  English = 'English',
  French = 'français, française',
  Indonesian = 'Bahasa Indonesia',
  Japanese = '日本語',
  Korean = '한국어, 조선말',
  Portuguese = 'Português',
  Russian = 'русский язык',
  Spanish = 'español, castellano',
  Turkish = 'Türkçe',
  Vietnamese = 'Tiếng Việt',
}

export const languagesMapping: Record<string, Language> = {
  'ab': Language.Arabic,
  'zh': Language.Chinese,
  'en': Language.English,
  'fr': Language.French,
  'id': Language.Indonesian,
  'ja': Language.Japanese,
  'ko': Language.Korean,
  'pt': Language.Portuguese,
  'ru': Language.Russian,
  'es': Language.Spanish,
  'tr': Language.Turkish,
  'vi': Language.Vietnamese,
};

export const availableLanguages = Object.values(Language);
