import * as cheerio from 'cheerio';
import { isUrlAbsolute } from '@utils/isAbsoluteUrl';
import {
  GetPopularNovelsParams,
  SourceChapter,
  SourceNovel,
  ParsedSource,
  GetSearchNovelsParams,
  SourceNovelsResponse,
} from '@sourcesV2/types';

const sourceId = 114;
const sourceName = 'LightNovelReader';
const baseUrl = 'https://lightnovelreader.org';

const getPopoularNovels = async ({
  page,
}: GetPopularNovelsParams): Promise<SourceNovelsResponse> => {
  const url = `${baseUrl}/ranking/top-rated/${page}/`;

  const result = await fetch(url);
  const body = await result.text();

  const $ = cheerio.load(body);

  const novels: SourceNovel[] = [];

  $('.category-items.ranking-category.cm-list > ul > li').each(function () {
    let novelUrl = $(this).find('a').attr('href');

    if (novelUrl && !isUrlAbsolute(novelUrl)) {
      novelUrl = baseUrl + novelUrl;
    }

    if (novelUrl) {
      const novelName = $(this).find('.category-name a').text().trim();
      let novelCover = $(this).find('.category-img img').attr('src');

      if (novelCover && !isUrlAbsolute(novelCover)) {
        novelCover = baseUrl + novelCover;
      }

      const novel = {
        sourceId,
        novelUrl,
        novelName,
        novelCover,
      };

      novels.push(novel);
    }
  });

  return { novels };
};

const getNovelDetails: ParsedSource['getNovelDetails'] = async ({
  novelUrl,
}) => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  let $ = cheerio.load(body);

  const novelName = $('.section-header-title > h2').text();

  const novel: SourceNovel = {
    sourceId,
    novelUrl,
    novelName,
    chapters: [],
  };

  let novelCover = $('.novels-detail img').attr('src');

  novel.novelCover = novelCover
    ? isUrlAbsolute(novelCover)
      ? novelCover
      : baseUrl + novelCover
    : undefined;

  novel.summary = $(
    'div.container > div > div.col-12.col-xl-9 > div > div:nth-child(5) > div',
  )
    .text()
    .trim();

  novel.author = $(
    'div.novels-detail-right > ul > li:nth-child(6) > .novels-detail-right-in-right > a',
  )
    .text()
    .trim();

  novel.genre = $(
    'body > section:nth-child(4) > div > div > div.col-12.col-xl-9 > div > div:nth-child(2) > div > div.novels-detail-right > ul > li:nth-child(3) > div.novels-detail-right-in-right',
  )
    .text()
    .trim()
    .replace(/[\t\n ]+/g, ',');

  novel.status = $(
    'div.novels-detail-right > ul > li:nth-child(2) > .novels-detail-right-in-right',
  )
    .text()
    .trim();

  $('.cm-tabs-content > ul > li').each(function () {
    let chapterUrl = $(this).find('a').attr('href');

    if (chapterUrl && !isUrlAbsolute(chapterUrl)) {
      chapterUrl = baseUrl + chapterUrl;
    }

    if (chapterUrl) {
      const chapterName = $(this).find('a').text().trim();
      const releaseDate = null;

      const chapter: SourceChapter = {
        chapterName,
        releaseDate,
        chapterUrl,
      };

      novel.chapters?.push(chapter);
    }
  });

  return novel;
};

const getChapter: ParsedSource['getChapter'] = async ({ chapterUrl }) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  const $ = cheerio.load(body);

  const chapterName = $('.section-header-title h2').text();
  const chapterText = $('#chapterText').html() || '';

  const chapter: SourceChapter = {
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

interface searchData {
  overview: string;
  original_title: string;
  link: string;
  image: string;
}

const getSearchNovels = async ({
  searchTerm,
}: GetSearchNovelsParams): Promise<SourceNovelsResponse> => {
  const url = `${baseUrl}/search/autocomplete?dataType=json&query=${searchTerm}`;

  const result = await fetch(url, { method: 'POST' });
  const body = await result.json();
  const data: searchData[] = body.results;

  const novels: SourceNovel[] = [];

  data.forEach(item => {
    let novelUrl = item.link;
    let novelName = item.original_title
      .replace(/&#8220;|&#8221;/g, '"')
      .replace(/&#[0-9]*;/g, ' ');
    let novelCover = item.image;

    novels.push({
      sourceId,
      novelUrl,
      novelName,
      novelCover,
    });
  });

  return { novels };
};

const LightNovelReaderParser: ParsedSource = {
  id: sourceId,
  baseUrl,
  iconUrl:
    'https://github.com/LNReader/lnreader-sources/blob/main/icons/src/en/lightnovelreader/icon.png?raw=true',
  lang: 'en',
  name: sourceName,
  getPopoularNovels,
  getNovelDetails,
  getChapter,
  getSearchNovels,
};

export default LightNovelReaderParser;
