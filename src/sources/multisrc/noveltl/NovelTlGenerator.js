import MultiSrcScraper from './NovelTlScraper';

const RuRanobeScraper = new MultiSrcScraper(
	149,
	'https://ruranobe.ru',
	'РуРанобэ',
);

const UkrRanobeScraper = new MultiSrcScraper(
	150,
	'https://ukr.novel.tl',
	'Переклади українською мовою',
);

const NightnovelScraper = new MultiSrcScraper(
	151,
	'https://nightnovel.online',
	'Nightnovel',
);

const KgRanobeScraper = new MultiSrcScraper(
	152,
	'https://kg.novel.tl',
	'Карманная галактика',
);

export {
	RuRanobeScraper,
	UkrRanobeScraper,
	NightnovelScraper,
	KgRanobeScraper,
};
