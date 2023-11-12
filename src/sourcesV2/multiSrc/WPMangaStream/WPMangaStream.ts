import * as cheerio from 'cheerio';

import {
  GetChapterParams,
  GetNovelDetailsParams,
  GetPopularNovelsParams,
  GetSearchNovelsParams,
  NovelStatus,
  ParsedSource,
  Source,
  SourceChapter,
  SourceFilter,
  SourceNovel,
  SourceNovelsResponse,
} from '@sourcesV2/types';
import { parseRelativeDate } from '@sourcesV2/utils';
import { fetchHtml } from '@utils/fetch/fetch';

interface WPMangaStreamOptions {}

const defaultOptions: WPMangaStreamOptions = {};

interface WPMangaStreamSource extends Source {
  options?: WPMangaStreamOptions;
}

export class WPMangaStreamParser implements ParsedSource {
  id: number;
  name: string;
  baseUrl: string;
  iconUrl: string;
  lang: string;
  isLatestSupported?: boolean;
  isNsfw?: boolean;
  filters?: SourceFilter[];
  options: WPMangaStreamOptions;

  constructor({
    name,
    baseUrl,
    id,
    iconUrl,
    lang = 'en',
    options,
  }: WPMangaStreamSource) {
    this.id = id;
    this.name = name;
    this.baseUrl = baseUrl;
    this.iconUrl = iconUrl;
    this.lang = lang;
    this.options = { ...defaultOptions, ...options };
  }

  async getPopoularNovels({
    page,
  }: GetPopularNovelsParams): Promise<SourceNovelsResponse> {
    const sourceId = this.id;
    const url =
      this.baseUrl + 'series/?page=' + page + '&status=&order=popular';

    const res = await fetchHtml({ url, sourceId });
    const $ = cheerio.load(res);

    const novels: SourceNovel[] = [];

    $('article.bs').each(function () {
      const novelName = $(this).find('.ntitle').text().trim();
      const novelCover = $(this).find('img').attr('src');
      const novelUrl = $(this).find('a').attr('href');

      if (novelUrl) {
        novels.push({
          sourceId,
          novelName,
          novelCover,
          novelUrl,
        });
      }
    });

    return {
      novels,
    };
  }

  async getNovelDetails({
    novelUrl,
  }: GetNovelDetailsParams): Promise<SourceNovel> {
    const sourceId = this.id;

    const res = await fetchHtml({ url: novelUrl, sourceId });
    const $ = cheerio.load(res);

    $('.manga-title-badges').remove();

    const title = $('.entry-title').text();
    const coverUrl = $('img.wp-post-image').attr('src');
    const description = $('div[itemprop="description"]').text().trim();

    let genre, author, status;

    $('div.spe > span').each(function () {
      const detailKey = $(this).find('b').text().trim();
      const detailValue = $(this).find('b').next().text().trim();

      switch (detailKey) {
        case 'المؤلف:':
        case 'Yazar:':
        case 'Autor:':
          author = detailValue;
          break;
        case 'Status:':
        case 'Seviye:':
          status = ['OnGoing', 'مستمرة', 'Devam Eden'].includes(detailValue)
            ? NovelStatus.Ongoing
            : NovelStatus.Completed;
          break;
        case 'Tipo:':
        case 'Tür:':
          genre = detailValue?.replace(/\s/g, ',');
          break;
      }
    });

    const chapters: SourceChapter[] = [];

    $('.eplister')
      .find('li')
      .each(function () {
        const chapterNumberString = $(this).find('.epl-num').text();

        const chapterName =
          chapterNumberString + ' - ' + $(this).find('.epl-title').text();

        const chapterUrl = $(this).find('a').attr('href');

        const dateUploadString = $(this).find('.epl-date').text().trim();
        const releaseDate = parseRelativeDate(dateUploadString);

        if (chapterUrl) {
          chapters.push({
            chapterName,
            releaseDate,
            chapterUrl,
          });
        }
      });

    return {
      sourceId,
      url,
      title,
      coverUrl,
      description,
      genre,
      author,
      status,
      chapters,
    };
  }

  async getChapter({ chapterUrl }: GetChapterParams): Promise<SourceChapter> {
    const sourceId = this.id;

    const res = await fetchHtml({ url: chapterUrl, sourceId });
    const $ = cheerio.load(res);

    const chapterText = $('div.epcontent').html();

    return {
      chapterUrl,
      chapterName: '',
      chapterText,
    };
  }

  async getSearchNovels({
    searchTerm,
  }: GetSearchNovelsParams): Promise<SourceNovelsResponse> {
    const sourceId = this.id;
    const url = `${this.baseUrl}?s=${searchTerm}`;

    const res = await fetchHtml({ url, sourceId });
    const $ = cheerio.load(res);

    const novels: SourceNovel[] = [];

    $('article.bs').each(function () {
      const novelName = $(this).find('.ntitle').text().trim();
      const novelCover = $(this).find('img').attr('src');
      const novelUrl = $(this).find('a').attr('href');

      if (novelUrl) {
        novels.push({
          sourceId,
          novelName,
          novelCover,
          novelUrl,
        });
      }
    });
    return {
      novels,
    };
  }
}
