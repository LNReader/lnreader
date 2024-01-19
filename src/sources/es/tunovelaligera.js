import * as cheerio from 'cheerio';
import { defaultCoverUri, Status } from '../helpers/constants';
import { fetchHtml } from '@utils/fetch/fetch';
import { showToast } from '@hooks/showToast';
import { FilterInputs } from '../types/filterTypes';

const sourceId = 23;
const sourceName = 'TuNovelaLigera';

const baseUrl = 'https://tunovelaligera.com/';

const popularNovels = async page => {
  let url = `${baseUrl}`;
  url += filters?.genres ? `genero/` + filters.genres : 'novelas';
  url += `/page/${page}`;
  url += filters?.order ?  `?m_orderby=` + filters.order : '?m_orderby=views';

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

  const delay = ms => new Promise(res => setTimeout(res, ms));
  let lastPage = 1;
  lastPage = loadedCheerio('.lcp_paginator li:last').prev().text().trim();

  const getChapters = async () => {
    const chaptersAjax = `${baseUrl}wp-admin/admin-ajax.php`;
    showToast('Cargando desde Archivo...');

    let formData = new FormData();
    formData.append('action', 'madara_load_more');
    formData.append('page', '0');
    formData.append('template', 'html/loop/content');
    formData.append('vars[category_name]', novelUrl.slice(0, -1));
    formData.append('vars[posts_per_page]', '10000');

    const formBody = await fetchHtml({
      url: chaptersAjax,
      init: {
        method: 'POST',
        body: formData,
      },
      sourceId,
    });

    const loadedCheerio = cheerio.load(formBody);

    loadedCheerio('.heading').each((i, el) => {
      const chapterName = loadedCheerio(el)
        .text()
        .replace(/[\t\n]/g, '')
        .trim();
      const releaseDate = null;
      let chapterUrl = loadedCheerio(el).find('a').attr('href');
      chapterUrl = chapterUrl.replace(`${baseUrl}${novelUrl}`, '');

      novelChapters.push({ chapterName, releaseDate, chapterUrl });
    });
    return novelChapters.reverse();
  };

  const getPageChapters = async () => {
    for (let i = 1; i <= lastPage; i++) {
      const chaptersUrl = `${baseUrl}novelas/${novelUrl}?lcp_page0=${i}`;
      showToast(`Cargando desde la página ${i}/${lastPage}...`);
      const chaptersHtml = await fetchHtml({
        url: chaptersUrl,
        sourceId,
      });

      loadedCheerio = cheerio.load(chaptersHtml);
      loadedCheerio('h2:contains("Resumen")')
        .closest('div')
        .next()
        .find('ul:first li')
        .each((i, el) => {
          const chapterName = loadedCheerio(el)
            .find('a')
            .text()
            .replace(/[\t\n]/g, '')
            .trim();

          const releaseDate = loadedCheerio(el).find('span').text().trim();

          const chapterUrl = loadedCheerio(el).find('a').attr('href');

          novelChapters.push({ chapterName, releaseDate, chapterUrl });
        });
      await delay(2000);
    }
    return novelChapters.reverse();
  };

  // novel.chapters = await getChapters();
  // if (!novel.chapters.length) {
  //   showToast('¡Archivo no encontrado!');
  //   await delay(1000);
  //
  // }

  novel.chapters = await getPageChapters();

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = `${baseUrl}${novelUrl}${chapterUrl}`;

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1#chapter-heading').text();

  let pageText = loadedCheerio('li:contains("A")').closest('div').next();

  let cleanup = [];
  pageText.find('div').each((i, el) => {
    let hb = loadedCheerio(el).attr('id')?.match(/hb.*/);
    if (!hb) {
      return;
    }
    let idAttr = `div[id="${hb}"]`;
    cleanup.push(idAttr);
  });

  cleanup.push(
    'center',
    '.clear',
    '.code-block',
    '.ai-viewport-2',
    '.cbxwpbkmarkwrap',
    '.flagcontent-form-container',
    'strong:last',
  );

  cleanup.map(tag => pageText.find(tag).remove());
  pageText.find('a, span').removeAttr();

  const chapterText = pageText.html();

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

  const body = await fetchHtml({ url, sourceId });

  const loadedCheerio = cheerio.load(body);

  const novels = [];

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

const filters = [
  {
    key: 'sort',
    label: 'Clasificar por:',
    values: [
      { label: 'A-Z', value: 'alphabet' },
      { label: 'Clasificacion', value: 'rating' },
      { label: 'Hot', value: 'trending' },
      { label: 'Mas visto', value: 'views' },
      { label: 'Nuevo', value: 'new-manga' },
      { label: 'Mas Nuevo', value: 'latest' },
    ],
    inputType: FilterInputs.Picker,
  },
  {
    key: 'genres',
    label: 'Generos',
    values: [
      { label: 'Acción', value: 'accion' },
      { label: 'Adulto', value: 'adulto' },
      { label: 'Artes Marciales', value: 'artes-marciales' },
      { label: 'Aventura', value: 'aventura' },
      { label: 'Ciencia Ficción', value: 'ciencia-ficcion' },
      { label: 'Comedia', value: 'comedia' },
      { label: 'Deportes', value: 'deportes' },
      { label: 'Drama', value: 'drama' },
      { label: 'Eastern Fantasy', value: 'eastern-fantasy' },
      { label: 'Ecchi', value: 'ecchi' },
      { label: 'FanFiction', value: 'fan-fiction' },
      { label: 'Fantasía', value: 'fantasia' },
      { label: 'Fantasía oriental', value: 'fantasia-oriental' },
      { label: 'Ficción Romántica', value: 'ficcion-romantica' },
      { label: 'Gender Bender', value: 'gender-bender' },
      { label: 'Harem', value: 'harem' },
      { label: 'Histórico', value: 'historico' },
      { label: 'Horror', value: 'horror' },
      { label: 'Josei', value: 'josei' },
      { label: 'Maduro', value: 'maduro' },
      { label: 'Mecha', value: 'mecha' },
      { label: 'Misterio', value: 'misterio' },
      { label: 'Novela China', value: 'novela-china' },
      { label: 'Novela FanFiction', value: 'novela-fanfiction' },
      { label: 'Novela Japonesa', value: 'novela-japonesa' },
      { label: 'Novela Koreana', value: 'novela-koreana' },
      { label: 'Novela ligera', value: 'novela-ligera' },
      { label: 'Novela original', value: 'novela-original' },
      { label: 'Novela Web', value: 'web-novel' },
      { label: 'Psicológico', value: 'psicologico' },
      { label: 'Realismo Mágico', value: 'realismo-magico' },
      { label: 'Recuento de vida', value: 'recuento-de-vida' },
      { label: 'Romance', value: 'romance' },
      { label: 'Romance contemporáneo', value: 'romance-contemporaneo' },
      { label: 'Romance Moderno', value: 'romance-moderno' },
      { label: 'Seinen', value: 'seinen' },
      { label: 'Shoujo', value: 'shoujo' },
      { label: 'Shounen', value: 'shounen' },
      { label: 'Sobrenatural', value: 'sobrenatural' },
      { label: 'Tragedia', value: 'tragedia' },
      { label: 'Vampiros', value: 'vampiros' },
      { label: 'Vida Escolar', value: 'vida-escolar' },
      { label: 'Fantasia Oriental', value: 'western-fantasy' },
      { label: 'Wuxia', value: 'wuxia' },
      { label: 'Xianxia', value: 'xianxia' },
      { label: 'Xuanhuan', value: 'xuanhuan' },
      { label: 'Yaoi', value: 'yaoi' },
    ],
    inputType: FilterInputs.Picker,
  },
];

const TuNovelaLigeraScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default TuNovelaLigeraScraper;
