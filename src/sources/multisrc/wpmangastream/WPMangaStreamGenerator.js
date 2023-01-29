import WPMangaStreamScraper from './WPMangaStreamScraper';

export const LiebeSchneeHiverNovelScraper = new WPMangaStreamScraper(
  123,
  'https://lshnovel.com/',
  'Liebe Schnee Hiver Novel',
  { totalPages: 1 },
);

export const LightNovelsBrasilScraper = new WPMangaStreamScraper(
  129,
  'https://lightnovelbrasil.com/',
  'Light Novels Brasil',
  { totalPages: 5 },
);
