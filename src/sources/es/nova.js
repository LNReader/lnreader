import * as cheerio from 'cheerio';
import { fetchHtml } from '@utils/fetch/fetch';
import { bypassImages } from '@utils/cloudflareImagesBypass';

const baseUrl = 'https://novelasligeras.net';
const searchQuery =
  '/wp-admin/admin-ajax.php?tags=1&sku=&limit=30&category_results=&order=DESC&category_limit=5&order_by=title&product_thumbnails=1&title=1&excerpt=1&content=&categories=1&attributes=1';

const sourceName = 'NOVA';
const sourceId = 166;
const parsedChapters = {};

const popularNovels = async page => {
  return { novels: await searchNovels('', page) };
};

const parseNovelAndChapters = async novelUrl => {
  const url = baseUrl + novelUrl;

  const body = await fetchHtml({ url });
  const loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url,
    novelUrl,
  };

  const novelCoverImg = loadedCheerio('.woocommerce-product-gallery').find(
    'img',
  );

  novel.novelName = loadedCheerio('h1').text();
  novel.novelCover =
    novelCoverImg.attr('src') || novelCoverImg.attr('data-cfsrc');

  novel.artist = loadedCheerio(
    '.woocommerce-product-attributes-item--attribute_pa_ilustrador td',
  ).text();
  novel.author = loadedCheerio(
    '.woocommerce-product-attributes-item--attribute_pa_escritor td',
  ).text();
  novel.status = loadedCheerio(
    '.woocommerce-product-attributes-item--attribute_pa_estado td',
  ).text();

  novel.summary = loadedCheerio(
    '.woocommerce-product-details__short-description',
  ).text();

  novel.chapters = [];

  loadedCheerio('.vc_row div.vc_column-inner > div.wpb_wrapper').each(
    function () {
      const e = loadedCheerio(this);
      const volume = e.find('.dt-fancy-title').first().text();

      if (!volume.startsWith('Volumen')) {
        return;
      }

      e.find('.wpb_tab a').map(function () {
        const chapterPartName = loadedCheerio(this).text();
        const chapterUrl = loadedCheerio(this)
          .attr('href')
          .replace(baseUrl, '');

        const match = chapterPartName.match(/(Parte \d+) . (.+?): (.+)/);
        const part = match?.[1];
        const chapter = match?.[2];
        const name = match?.[3];

        let chapterName;
        if (part && chapter) {
          chapterName = `${volume} - ${chapter} - ${part}: ${name}`;
        } else {
          chapterName = `${volume} - ${chapterPartName}`;
        }

        novel.chapters.push({ chapterName, chapterUrl });
      });
    },
  );

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = baseUrl + chapterUrl;

  const body = await fetchHtml({ url });
  const loadedCheerio = cheerio.load(body);

  let chapterName = loadedCheerio('h2')
    .toArray()
    .map(e => loadedCheerio(e).text())
    .join(' ');

  let chapterText;
  if (body.includes('Nadie entra sin permiso en la Gran Tumba de Nazarick')) {
    chapterText = loadedCheerio('#content');
  } else {
    chapterText = loadedCheerio(
      '.wpb_text_column.wpb_content_element > .wpb_wrapper',
    );
  }

  // Remove ads
  chapterText.find('center').each(function () {
    loadedCheerio(this).remove();
  });

  chapterText.find('*').each(function () {
    if (/text-align:.center/.test(loadedCheerio(this).attr('style'))) {
      loadedCheerio(this).replaceWith(
        `<center>${loadedCheerio(this).html()}</center>`,
      );
    }
  });

  chapterText = await bypassImages(loadedCheerio, chapterText, sourceId);

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  parsedChapters[url] = chapter;
  return chapter;
};

const searchNovels = async (searchTerm, searchPage = 0) => {
  let novels = [];

  if (searchPage > 0) {
    const url = `${baseUrl}/index.php/page/${searchPage}/?s=${searchTerm}&post_type=product&title=1&excerpt=1&content=0&categories=1&attributes=1&tags=1&sku=0&orderby=popularity&ixwps=1`;

    const body = await fetchHtml({ url });
    const loadedCheerio = cheerio.load(body);

    loadedCheerio('.dt-css-grid')
      .find('div.wf-cell')
      .each(function () {
        const img = loadedCheerio(this).find('img');
        novels.push({
          sourceId,
          novelName: loadedCheerio(this).find('h4.entry-title a').text(),
          novelCover: img.attr('data-src') || img.attr('data-cfsrc'),
          novelUrl: loadedCheerio(this)
            .find('h4.entry-title a')
            .attr('href')
            .replace(baseUrl, ''),
        });
      });
  } else {
    const url = baseUrl + searchQuery;
    const form = new FormData();

    form.append('action', 'product_search');
    form.append('product-search', searchPage ?? 1);
    form.append('product-query', searchTerm);

    const data = await fetchHtml({
      url,
      init: {
        method: 'POST',
        body: form,
      },
      sourceId: sourceId.toString(),
    });

    novels = JSON.parse(data).map(novel => ({
      sourceId,
      novelName: novel.title,
      novelCover: novel.thumbnail,
      novelUrl: novel.url.replace(baseUrl, ''),
    }));
  }

  return novels;
};

const NOVAScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default NOVAScraper;
