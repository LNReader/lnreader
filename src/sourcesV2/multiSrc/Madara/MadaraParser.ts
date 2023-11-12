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

interface MadaraOptions {
  popularNovelsPath?: string;
  reverseChapters?: boolean;

  /**
   * @default true
   */
  useNewChapterEndpoint?: boolean;
}

interface MadaraSource extends Source {
  options?: MadaraOptions;
}

const defaultPath = 'novel';

const defaultOptions: MadaraOptions = {
  popularNovelsPath: defaultPath,
  useNewChapterEndpoint: true,
  reverseChapters: true,
};

export class MadaraParser implements ParsedSource {
  id: number;
  name: string;
  baseUrl: string;
  iconUrl: string;
  lang: string;
  isLatestSupported?: boolean;
  isNsfw?: boolean;
  filters?: SourceFilter[];
  options: MadaraOptions;

  constructor({
    name,
    baseUrl,
    id,
    iconUrl,
    lang = 'en',
    options,
  }: MadaraSource) {
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
      this.baseUrl +
      this.options.popularNovelsPath +
      '/page/' +
      page +
      '/?m_orderby=rating';

    const res = await fetchHtml({ url, sourceId });
    const $ = cheerio.load(res);

    const novels: SourceNovel[] = [];

    $('.manga-title-badges').remove();

    $('.page-item-detail').each(function () {
      const novelName = $(this).find('.post-title').text().trim();
      const cover = $(this).find('img');
      const novelCover = cover.attr('data-src') || cover.attr('src');

      const novelUrl = $(this).find('.post-title').find('a').attr('href');

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
    let $ = cheerio.load(res);

    $('.manga-title-badges').remove();

    const novelName =
      $('.post-title').text().trim() || $('#manga-title').text().trim();

    const cover = $('.summary_image > a > img');
    const novelCover = cover.attr('data-src') || cover.attr('src');

    let summary =
      $('div.summary__content')
        .text()
        .trim()
        .replace(/(Description| Synopsis)(:?)(\s|\n)+/g, '') ||
      $('.manga-excerpt').text().trim();

    let genre, author, status;

    $('.post-content_item').each(function () {
      const detailKey =
        $(this).find('.summary-heading > h5').text().trim() ||
        $(this).find('h5').text().trim();

      const detailValue =
        $(this).find('.summary-content').text().trim() ||
        $(this).find('div').text().trim();

      switch (detailKey) {
        case 'Genre(s)':
        case 'التصنيفات':
        case 'Tarz(lar)':
          genre = detailValue.replace(/[\t\n]/g, ',');
          break;
        case 'Author(s)':
        case 'المؤلف':
        case 'Yazar(lar)':
          author = detailValue;
          break;
        case 'Status':
        case 'الحالة':
        case 'Durum':
          status = ['OnGoing', 'مستمرة', 'Devam Eden'].includes(detailValue)
            ? NovelStatus.Ongoing
            : NovelStatus.Completed;
          break;
        case 'Summary':
          summary ??= detailValue;
          break;
      }
    });

    const chapters: SourceChapter[] = [];

    let chaptersHtml;

    if (this.options.useNewChapterEndpoint) {
      const chaptersUrl = novelUrl + 'ajax/chapters/';

      chaptersHtml = await fetchHtml({
        url: chaptersUrl,
        init: {
          method: 'POST',
        },
        sourceId,
      });
    } else {
      const chaptersUrl = this.baseUrl + 'wp-admin/admin-ajax.php';

      const novelId =
        $('.rating-post-id').attr('value') ||
        $('#manga-chapters-holder').attr('data-id');

      const formData = new FormData();

      formData.append('action', 'manga_get_chapters');
      formData.append('manga', novelId);

      chaptersHtml = await fetchHtml({
        url: chaptersUrl,
        init: {
          method: 'POST',
          body: formData,
        },
        sourceId,
      });
    }

    if (chaptersHtml !== '0') {
      $ = cheerio.load(chaptersHtml);
    }

    $('.wp-manga-chapter').each(function () {
      const chapterName = $(this).find('a').text().trim();
      const chapterUrl = $(this).find('a').attr('href');

      const dateUploadString = $(this)
        .find('span.chapter-release-date')
        .text()
        .trim();
      const releaseDate = parseRelativeDate(dateUploadString);

      if (chapterUrl) {
        chapters.push({
          chapterName,
          releaseDate,
          chapterUrl,
        });
      }
    });

    if (this.options.reverseChapters) {
      chapters.reverse();
    }

    return {
      sourceId,
      novelUrl,
      novelName,
      novelCover,
      summary,
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

    const chapterName = $('.breadcrumb > li.active').text();
    const chapterText = $('.text-left').html() || $('.text-right').html();

    return {
      chapterUrl,
      chapterName,
      chapterText,
    };
  }

  async getSearchNovels({
    searchTerm,
    page,
  }: GetSearchNovelsParams): Promise<SourceNovelsResponse> {
    const sourceId = this.id;
    const url = `${this.baseUrl}/page/${page}/?s=${searchTerm}&post_type=wp-manga`;

    const res = await fetchHtml({ url, sourceId });
    const $ = cheerio.load(res);

    $('.manga-title-badges').remove();

    const novels: SourceNovel[] = [];

    $('.c-tabs-item__content').each(function () {
      const novelName = $(this).find('.post-title').text().trim();

      const cover = $(this).find('img');
      const novelCover = cover.attr('data-src') || cover.attr('src');

      const novelUrl = $(this).find('.post-title').find('a').attr('href');

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
