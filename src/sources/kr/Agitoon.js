import * as cheerio from 'cheerio';

const sourceId = 145;
const sourceName = 'Agitoon';
const baseUrl = 'https://agit501.xyz/';

const popularNovels = async page => {
  const list_limit = 20 * (page - 1);
  const day = new Date().getDay();

  const res = await fetch(baseUrl + 'novel/index.update.php', {
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: `mode=get_data_novel_list_p&novel_menu=3&np_day=${day}&np_rank=1&np_distributor=0&np_genre=00&np_order=1&np_genre_ex_1=00&np_genre_ex_2=00&list_limit=${list_limit}&is_query_first=true`,
    method: 'POST',
  });

  const resJson = await res.json();

  const novels = resJson.list.map(novel => {
    return {
      sourceId,
      novelUrl: baseUrl + 'novel/list/' + novel.wr_id,
      novelName: novel.wr_subject,
      novelCover: baseUrl + novel.np_dir + '/thumbnail/' + novel.np_thumbnail,
    };
  });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const novelId = novelUrl.split('/').reverse()[0];

  // cheerio
  const result = await fetch(novelUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body, { decodeEntities: false });
  const novelName = loadedCheerio('h5.pt-2').text();
  const summary = loadedCheerio('.pt-1.mt-1.pb-1.mb-1').text();
  const author = loadedCheerio('.post-item-list-cate-v')
    .first()
    .text()
    .split(' : ')
    .reverse()[0];
  const novelCover =
    baseUrl.slice(0, baseUrl.length - 1) +
    loadedCheerio('div.col-5.pr-0.pl-0 img').attr('src');
  const genresTag = loadedCheerio('.col-7 > .post-item-list-cate > span');
  let genres = '';

  genresTag.each((_, element) => {
    genres += loadedCheerio(element).text();
    genres += ', ';
  });
  genres = genres.slice(0, genres.length - 2);

  // normal REST HTTP requests
  let chapters = [];

  const res = await fetch(baseUrl + 'novel/list.update.php', {
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: `mode=get_data_novel_list_c&wr_id_p=${novelId}&page_no=1&cnt_list=10000&order_type=Asc`,
    method: 'POST',
  });

  const resJson = await res.json();

  chapters = resJson.list.map(chapter => {
    return {
      chapterId: chapter.wr_id,
      chapterName: chapter.wr_subject,
      chapterUrl: baseUrl + `novel/view/${chapter.wr_id}/2`,
      releaseDate: chapter.wr_datetime,
    };
  });

  const novel = {
    sourceId,
    sourceName,
    novelUrl,
    novelName,
    novelCover,
    summary,
    author,
    status: '',
    genre: genres,
    url: novelUrl,
    chapters,
  };
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(chapterUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);

  const title = loadedCheerio('div > div.col-12 > h2').text();
  const contentTag = loadedCheerio('#id_wr_content > p');

  let content = '';
  contentTag.each((_, element) => {
    content += loadedCheerio(element).text();
    content += '<br />';
  });

  // gets rid of the popup thingy
  content = content.replace(
    '팝업메뉴는 빈공간을 더치하거나 스크룰시 사라집니다',
    '',
  );

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName: title,
    chapterText: content,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const rawResults = await fetch('https://agit501.xyz/novel/search.php', {
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: `mode=get_data_novel_list_p_sch&search_novel=${searchTerm}&list_limit=0`,
    method: 'POST',
  });

  const results = await rawResults.json();

  if (!results.list && results.list.length() === 0) {
    return [];
  }

  const novels = results.list.map(result => {
    return {
      sourceId,
      novelUrl: baseUrl + 'novel/list/' + result.wr_id,
      novelName: result.wr_subject,
      novelCover: baseUrl + result.np_dir + '/thumbnail/' + result.np_thumbnail,
    };
  });

  return novels;
};

const AgitoonScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default AgitoonScraper;
