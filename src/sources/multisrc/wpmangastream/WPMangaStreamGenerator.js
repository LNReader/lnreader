import WPMangaStreamScraper from './WPMangaStreamScraper';

export const NobleMtlScraper = new WPMangaStreamScraper(
  144,
  'https://noblemtl.com/',
  'Noble Machine translations',
  { totalPages: 14 },
);

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
