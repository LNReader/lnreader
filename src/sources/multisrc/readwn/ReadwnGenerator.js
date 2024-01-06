import MultiSrcScraper from './ReadwnScraper';

const ReadwnScraper = new MultiSrcScraper(
  68,
  'https://www.wuxiap.com/',
  'Readwn.com',
  {
    label: 'Genre / Category',
    values: [
      { label: 'Chinese', value: 'chinese' },
      { label: 'Erciyuan', value: 'erciyuan' },
      { label: 'Faloo', value: 'faloo' },
      { label: 'Fan-Fiction', value: 'fan-fiction' },
      { label: 'Hentai', value: 'hentai' },
      { label: 'Isekai', value: 'isekai' },
      { label: 'Japanese', value: 'japanese' },
      { label: 'Korean', value: 'korean' },
      { label: 'Magic', value: 'magic' },
      { label: 'Military', value: 'military' },
      { label: 'Official Circles', value: 'official_circles' },
      { label: 'Science Fiction', value: 'science_fiction' },
      { label: 'Shoujo Ai', value: 'shoujo-ai' },
      { label: 'Suspense Thriller', value: 'suspense_thriller' },
      { label: 'Travel Through Time', value: 'travel_through_time' },
      { label: 'Two-dimensional', value: 'two-dimensional' },
      { label: 'Urban', value: 'urban' },
      { label: 'Urban Life', value: 'urban-life' },
      { label: 'Virtual Reality', value: 'virtual-reality' },
      { label: 'Wuxia Xianxia', value: 'wuxia_xianxia' },
      { label: 'Yuri', value: 'yuri' },
    ],
  },
);

const NovelmtScraper = new MultiSrcScraper(
  99,
  'https://www.wuxiapub.com/',
  'Novelmt.com',
  {
    label: 'Genre / Category',
    values: [
      { label: 'Billionaire', value: 'billionaire' },
      { label: 'CEO', value: 'ceo' },
      { label: 'Chinese', value: 'chinese' },
      { label: 'Ecchi', value: 'ecchi' },
      { label: 'Erciyuan', value: 'erciyuan' },
      { label: 'Faloo', value: 'faloo' },
      { label: 'Fan-Fiction', value: 'fan-fiction' },
      { label: 'Farming', value: 'farming' },
      { label: 'Games', value: 'games' },
      { label: 'Gay Romance', value: 'gay-romance' },
      { label: 'Historical Romance', value: 'historical-romance' },
      { label: 'Isekai', value: 'isekai' },
      { label: 'Japanese', value: 'japanese' },
      { label: 'Korean', value: 'korean' },
      { label: 'Magic', value: 'magic' },
      { label: 'Military', value: 'military' },
      { label: 'Modern Life', value: 'modern-life' },
      { label: 'Modern Romance', value: 'modern-romance' },
      { label: 'Romantic', value: 'romantic' },
      { label: 'Shoujo Ai', value: 'shoujo-ai' },
      { label: 'Smut', value: 'smut' },
      { label: 'Two-dimensional', value: 'two-dimensional' },
      { label: 'Urban', value: 'urban' },
      { label: 'Urban Life', value: 'urban-life' },
      { label: 'Virtual Reality', value: 'virtual-reality' },
      { label: 'Yuri', value: 'yuri' },
    ],
  },
);

const LtnovelScraper = new MultiSrcScraper(
  100,
  'https://www.ltnovel.com/',
  'Ltnovel.com',
  {
    label: 'Genre / Category',
    values: [
      { label: 'Adult', value: 'adult' },
      { label: 'Ecchi', value: 'ecchi' },
      { label: 'Mature', value: 'mature' },
      { label: 'Smut', value: 'smut' },
    ],
  },
);

export { ReadwnScraper, NovelmtScraper, LtnovelScraper };
