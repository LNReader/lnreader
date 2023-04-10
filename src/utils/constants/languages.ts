//seacrh here https://pastebin.com/raw/ppdMS687

export enum Languages {
  Arabic = 'العربية',
  Chinese = '中文 (Zhōngwén), 汉语, 漢語',
  English = 'English',
  French = 'français, langue française',
  Indonesian = 'Bahasa Indonesia',
  Japanese = '日本語 (にほんご／にっぽんご)',
  Korean = '한국어 (韓國語), 조선말 (朝鮮語)',
  Portuguese = 'Português',
  Russian = 'русский язык',
  Spanish = 'español, castellano',
  Turkish = 'Türkçe',
  Vietnamese = 'Tiếng Việt',
}

export const languagesMapping: Record<string, Languages> = {
  'ab': Languages.Arabic,
  'zh': Languages.Chinese,
  'en': Languages.English,
  'fr': Languages.French,
  'id': Languages.Indonesian,
  'ja': Languages.Japanese,
  'ko': Languages.Korean,
  'pt': Languages.Portuguese,
  'ru': Languages.Russian,
  'es': Languages.Spanish,
  'tr': Languages.Turkish,
  'vi': Languages.Vietnamese,
};

export const availableLanguages = Object.values(Languages);
