import WQMangaStreamScraper from './WQMangaStreamScraper';

export const PandaMtlScraper = new WQMangaStreamScraper(
  146,
  'https://pandamtl.com/',
  'Panda Machine translations',
  { reverseChapters: true },
);

export const KolNovelScraper = new WQMangaStreamScraper(
  53,
  'https://kolnovel.com/',
  'KolNovel',
);
