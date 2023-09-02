import MultiSrcScraper from './ReadwnScraper';

const ReadwnScraper = new MultiSrcScraper(
  68,
  'https://www.wuxiap.com/',
  'Readwn.com',
);

const NovelmtScraper = new MultiSrcScraper(
  99,
  'https://www.wuxiapub.com/',
  'Novelmt.com',
);

const LtnovelScraper = new MultiSrcScraper(
  100,
  'https://www.ltnovel.com/',
  'Ltnovel.com',
);

export { ReadwnScraper, NovelmtScraper, LtnovelScraper };
