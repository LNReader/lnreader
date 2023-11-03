import * as cheerio from 'cheerio';
import { defaultCoverUri, Status } from '../helpers/constants';
import { fetchHtml } from '@utils/fetch/fetch';
import { showToast } from '@hooks/showToast';

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

  const delay = ms => new Promise(res => setTimeout(res, ms));
  let lastPage = 1;
  lastPage = loadedCheerio('.lcp_paginator li:last').prev().text().trim();

  const getChapters = async () => {
    let novelChapters = [];
    for (let i = 1; i <= lastPage; i++) {
      const chaptersUrl = `${baseUrl}novelas/${novelUrl}?lcp_page0=${i}`;
      showToast(`Getting Chapters Page ${i}/${lastPage}...`);
      const chaptersHtml = await fetchHtml({
        url: chaptersUrl,
        sourceId,
      });

      loadedCheerio = cheerio.load(chaptersHtml);
      loadedCheerio('.lcp_catlist li').each((i, el) => {
        const chapterName = loadedCheerio(el)
          .find('a')
          .text()
          .replace(/[\t\n]/g, '')
          .trim();

        const releaseDate = loadedCheerio(el).find('span').text().trim();

        const chapterUrl = loadedCheerio(el).find('a').attr('href');

        novelChapters.push({ chapterName, releaseDate, chapterUrl });
      });
      await delay(1000);
    }
    return novelChapters.reverse();
  };

  novel.chapters = await getChapters();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const body = await fetchHtml({ url });

  let loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('h1#chapter-heading').text();

  loadedCheerio('#hola_siguiente').next().find('div').remove();
  let chapterText = loadedCheerio('#hola_siguiente').next().html();
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
