import WPMangaStreamScraper from './WPMangaStreamScraper';

export const KolNovelScraper = new WPMangaStreamScraper(
  53,
  'https://kolnovel.com/',
  'KolNovel',
);

export const LiebeSchneeHiverNovelScraper = new WPMangaStreamScraper(
  123,
  'https://lshnovel.com/',
  'Liebe Schnee Hiver Novel',
  { totalPages: 1 },
);
