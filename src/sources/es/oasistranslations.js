import cheerio from 'react-native-cheerio';

const baseUrl = 'https://oasistranslations.wordpress.com/';

const popularNovels = async page => {
  let url = baseUrl;

  let totalPages = 1;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.menu-item-1819')
    .find('.sub-menu > li')
    .each(function () {
      const novelName = loadedCheerio(this).text();
      if (!novelName.match(/Activas|Finalizadas|Dropeadas/)) {
        const novelCover = loadedCheerio(this).find('img').attr('src');

        let novelUrl = loadedCheerio(this).find('a').attr('href');
        novelUrl = novelUrl.split('/');
        novelUrl = novelUrl[novelUrl.length - 2] + '/';

        const novel = {
          sourceId: 30,
          novelName,
          novelCover,
          novelUrl,
        };

        novels.push(novel);
      }
    });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = baseUrl + novelUrl + '/';

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novel = {};

  novel.sourceId = 30;

  novel.sourceName = 'Oasis Translations';

  novel.url = url;

  novel.novelUrl = novelUrl;

  novel.novelName = loadedCheerio('h1.entry-title')
    .text()
    .replace(/[\t\n]/g, '')
    .trim();

  novel.novelCover = loadedCheerio('img[loading="lazy"]').attr('src');

  loadedCheerio('.entry-content > p').each(function (res) {
    if (loadedCheerio(this).text().includes('Autor')) {
      let details = loadedCheerio(this).html();
      details = details.match(/<\/strong>(.|\n)*?<br>/g);
      details = details.map(detail =>
        detail.replace(/<strong>|<\/strong>|<br>|:\s/g, ''),
      );

      novel.genre = '';

      novel.author = details[2];
      novel.genre = details[4].replace(/\s|&nbsp;/g, '');
      novel.artist = details[3];
    }
  });

  // let novelSummary = $(this).next().html();
  novel.summary = '';

  let novelChapters = [];

  // if ($(".entry-content").find("li").length) {
  loadedCheerio('.entry-content')
    .find('a')
    .each(function () {
      let chapterUrl = loadedCheerio(this).attr('href');

      if (chapterUrl && chapterUrl.includes(baseUrl)) {
        const chapterName = loadedCheerio(this).text();
        const releaseDate = null;

        chapterUrl = chapterUrl.split('/');
        chapterUrl = chapterUrl[chapterUrl.length - 2] + '/';

        const chapter = { chapterName, releaseDate, chapterUrl };

        novelChapters.push(chapter);
      }
    });
  // } else {
  //     $(".entry-content")
  //         .find("p")
  //         .each(function (result) {
  //             let chapterUrl = $(this).find("a").attr("href");

  //             if (chapterUrl && chapterUrl.includes(baseUrl)) {
  //                 const chapterName = $(this).text();
  //                 const releaseDate = null;

  //                 chapterUrl = chapterUrl.split("/");
  //                 chapterUrl = chapterUrl[chapterUrl.length - 2] + "/";

  //                 const chapter = { chapterName, releaseDate, chapterUrl };

  //                 novelChapters.push(chapter);
  //             }
  //         });
  // }

  novel.chapters = novelChapters;

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}/${novelUrl}/${chapterUrl}`;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('h1.entry-title').text();

  loadedCheerio('div#jp-post-flair').remove();

  let chapterText = loadedCheerio('.entry-content').html();
  novelUrl = novelUrl + '/';
  chapterUrl = chapterUrl + '/';

  const chapter = {
    sourceId: 30,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  searchTerm = searchTerm.toLowerCase();

  let url = baseUrl;

  const result = await fetch(url);
  const body = await result.text();

  let loadedCheerio = cheerio.load(body);

  let novels = [];
  loadedCheerio('.menu-item-1819')
    .find('.sub-menu > li')
    .each(function () {
      const novelName = loadedCheerio(this).text();
      if (!novelName.match(/Activas|Finalizadas|Dropeadas/)) {
        const novelCover = loadedCheerio(this).find('img').attr('src');

        let novelUrl = loadedCheerio(this).find('a').attr('href');
        novelUrl = novelUrl.split('/');
        novelUrl = novelUrl[novelUrl.length - 2] + '/';

        const novel = {
          sourceId: 30,
          novelName,
          novelCover,
          novelUrl,
        };

        novels.push(novel);
      }
    });

  novels = novels.filter(novel =>
    novel.novelName.toLowerCase().includes(searchTerm),
  );

  return novels;
};

const OasisTranslationsScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default OasisTranslationsScraper;
