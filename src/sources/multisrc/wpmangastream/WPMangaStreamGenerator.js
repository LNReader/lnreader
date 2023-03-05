import WPMangaStreamScraper from './WPMangaStreamScraper';

export const NobleMtlScraper = new WPMangaStreamScraper(
  144,
  'https://noblemtl.com/',
  'Noble Machine translations',
  { reverseChapters: true },
);

export const LiebeSchneeHiverNovelScraper = new WPMangaStreamScraper(
  123,
  'https://lshnovel.com/',
  'Liebe Schnee Hiver Novel',
);

export const LightNovelsBrasilScraper = new WPMangaStreamScraper(
  129,
  'https://lightnovelbrasil.com/',
  'Light Novels Brasil',
);
