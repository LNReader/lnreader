import * as cheerio from 'cheerio';
const scrapeTopNovels = async (pageNo: number) => {
  const url =
    'https://myanimelist.net/topmanga.php?type=lightnovels&limit=' + pageNo;

  const res = await fetch(url);
  const body = await res.text();

  const $ = cheerio.load(body);

  const novels: any[] = [];

  $('tr.ranking-list').each(function () {
    const novelId = $(this).find('img').attr('data-src')?.split('/') || '';

    const novelCover =
      'https://cdn.myanimelist.net/images/manga/' +
      novelId[7] +
      '/' +
      novelId[8].split('.')[0] +
      '.jpg';
    const novelName = $(this).find('h3').text();

    const score = $(this)
      .find('.js-top-ranking-score-col > span.score-label')
      .text();

    const info = $(this).find('div.information').text().split(/\s\s+/);
    const novel = { novelName, novelCover, score, info };

    novels.push(novel);
  });

  return novels;
};

const scrapeSearchResults = async (searchTerm: string) => {
  const url =
    'https://myanimelist.net/manga.php?q=' + searchTerm + '&cat=manga&type=2';

  const res = await fetch(url);
  const body = await res.text();

  const $ = cheerio.load(body);

  const novels: any[] = [];

  $('.list')
    .find('tr')
    .each(function () {
      const novelName = $(this).find('a > strong').text();

      if (novelName) {
        const novelId = $(this).find('img').attr('data-src')?.split('/') || '';

        const novelCover =
          'https://cdn.myanimelist.net/images/manga/' +
          novelId[7] +
          '/' +
          novelId[8].split('.')[0] +
          '.jpg';

        const score = $(this).find('td:nth-child(5)').text().trim();

        const novel = { novelName, novelCover, score };

        novels.push(novel);
      }
    });

  return novels;
};

export { scrapeTopNovels, scrapeSearchResults };
