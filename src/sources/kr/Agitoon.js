import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';
import { SourceChapter, SourceNovel, SourceNovelItem } from '../types';

const sourceId = 145;
const sourceName = 'Agitoon';
const baseUrl = 'https://agit501.xyz/';

const popularNovels = async page => {
  const totalPages = 1;

  const res = await fetch('https://agit501.xyz/novel/index.update.php', {
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: 'mode=get_data_novel_list_p&novel_menu=3&np_day=2&np_rank=0&np_distributor=0&np_genre=00&np_order=1&np_genre_ex_1=00&np_genre_ex_2=00&list_limit=0&is_query_first=true',
    method: 'POST',
  });

  const resJson = await res.json();
  const novels = resJson.list.map(novel => {
    return {
      sourceId,
      novelUrl: baseUrl + '/novel/list/' + novel.wr_id,
      novelName: novel.wr_subject,
      novelCover: baseUrl + novel.np_dir + '/thumbnail/' + novel.np_thumbnail,
    };
  });

  return { totalPages, novels };
};

const parseNovelAndChapters = async novelUrl => {
  return null;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  return null;
};

const searchNovels = async searchTerm => {
  return null;
};

const AgitoonScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default AgitoonScraper;
