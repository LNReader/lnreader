import * as cheerio from 'cheerio';
import { defaultCoverUri, Status } from '../helpers/constants';
import { fetchHtml } from '@utils/fetch/fetch';

const sourceId = 23;
const sourceName = 'TuNovelaLigera';

const baseUrl = 'https://tunovelaligera.com/';

const popularNovels = async page => {
  let url = `${baseUrl}novelas/page/${page}/?m_orderby=rating`;

  const body = await fetchHtml({ url });

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.page-item-detail').each(function () {
    const novelName = loadedCheerio(this).find('.h5 > a').text();
    const novelCoverImg = loadedCheerio(this).find('img');
    const novelCover =
      novelCoverImg.attr('src') || novelCoverImg.attr('data-cfsrc');

    let novelUrl = loadedCheerio(this)
      .find('.h5 > a')
      .attr('href')
      .split('/')[4];
    novelUrl += '/';

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const url = `${baseUrl}novelas/${novelUrl}`;

  const body = await fetchHtml({ url });

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
  };

  loadedCheerio('.manga-title-badges').remove();

  novel.novelName = loadedCheerio('.post-title > h1').text().trim();

  let novelCover = loadedCheerio('.summary_image img');

  novel.novelCover =
    novelCover.attr('data-src') ||
    novelCover.attr('src') ||
    novelCover.attr('data-cfsrc') ||
    defaultCoverUri;

  loadedCheerio('.post-content_item').each(function () {
    const detailName = loadedCheerio(this)
      .find('.summary-heading > h5')
      .text()
      .trim();
    const detail = loadedCheerio(this).find('.summary-content').text().trim();

    switch (detailName) {
      case 'Generos':
        novel.genre = detail.replace(/, /g, ',');
        break;
      case 'Autores':
        novel.author = detail;
        break;
      case 'Estado':
        novel.status =
          detail.includes('OnGoing') || detail.includes('Updating')
            ? Status.ONGOING
            : Status.COMPLETED;
        break;
    }
  });

  novel.summary = loadedCheerio('div.summary__content > p').text().trim();

  let novelChapters = [];

  const novelId =
    loadedCheerio('.rating-post-id').attr('value') ||
    loadedCheerio('#manga-chapters-holder').attr('data-id');

  let formData = new FormData();
  formData.append('action', 'manga_get_chapters');
  formData.append('manga', novelId);

  const text = await fetchHtml({
    url: 'https://tunovelaligera.com/wp-admin/admin-ajax.php',
    init: {
      method: 'POST',
      body: formData,
    },
  });

  loadedCheerio = cheerio.load(text);

  loadedCheerio('.wp-manga-chapter').each(function () {
    const chapterName = loadedCheerio(this)
      .find('a')
      .text()
      .replace(/[\t\n]/g, '')
      .trim();

    const releaseDate = loadedCheerio(this).find('span').text().trim();

    let chapterUrl = loadedCheerio(this).find('a').attr('href').split('/');

    chapterUrl[6]
      ? (chapterUrl = chapterUrl[5] + '/' + chapterUrl[6])
      : (chapterUrl = chapterUrl[5]);

    novelChapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = novelChapters.reverse();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}novelas/${novelUrl}/${chapterUrl}`;

  const body = await fetchHtml({ url });

  let loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('h1#chapter-heading').text();

  let chapterText = loadedCheerio('.text-left').html();
  novelUrl = novelUrl + '/';

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga`;

  const body = await fetchHtml({ url });

  let loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('.c-tabs-item__content').each(function () {
    const novelName = loadedCheerio(this).find('.h4 > a').text();
    const novelCoverImg = loadedCheerio(this).find('img');
    const novelCover =
      novelCoverImg.attr('src') ?? novelCoverImg.attr('data-cfsrc');

    let novelUrl = loadedCheerio(this).find('.h4 > a').attr('href');
    novelUrl = novelUrl.replace(`${baseUrl}novelas/`, '');

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
    };

    novels.push(novel);
  });

  return novels;
};

const TuNovelaLigeraScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default TuNovelaLigeraScraper;
