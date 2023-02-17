import WQMangaStreamScraper from './WQMangaStreamScraper';

export const PandaMtlScraper = new WQMangaStreamScraper(
  146,
  'https://pandamtl.com/',
  'Panda Machine translations',
  { totalPages: 7, reverseChapters: true },
);

export const KolNovelScraper = new WQMangaStreamScraper(
  53,
  'https://kolnovel.com/',
  'KolNovel',
  { totalPages: 22 },
);
