export const languages = [
  'Arabic',
  'Chinese',
  'English',
  'French',
  'Indonesian',
  'Japanese',
  'Korean',
  'Portuguese (Brazil)',
  'Russian',
  'Spanish',
  'Turkish',
  'Vietnamese',
];

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

export const availableLanguages = Object.keys(Languages).map(
  lang => Object.values(Languages)[Object.keys(Languages).indexOf(lang)],
);
