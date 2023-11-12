import * as cheerio from 'cheerio';
import dayjs from 'dayjs';

import {
  GetChapterParams,
  GetNovelDetailsParams,
  GetPopularNovelsParams,
  GetSearchNovelsParams,
  NovelStatus,
  ParsedSource,
  SourceChapter,
  SourceNovel,
  SourceNovelsResponse,
} from '@sourcesV2/types';
import { fetchHtml } from '@utils/fetch/fetch';

const StatusMap: Record<string, NovelStatus> = {
  'Complete': NovelStatus.Completed,
  'On-going': NovelStatus.Ongoing,
};

export class ComradeMaoParser implements ParsedSource {
  id = 27;

  name = 'ComradeMao';

  iconUrl =
    'https://github.com/LNReader/lnreader-sources/blob/main/icons/src/en/comrademao/icon.png?raw=true';

  baseUrl = 'https://comrademao.com/';

  lang = 'en';

  async getChapter({ chapterUrl }: GetChapterParams): Promise<SourceChapter> {
    const sourceId = this.id;

    const res = await fetchHtml({
      url: chapterUrl,
      sourceId,
    });

    const $ = cheerio.load(res);

    const chapterName = $('.doc_header').text();
    const chapterText = $('#chaptercontent').html();

    return {
      chapterUrl,
      chapterName,
      chapterText,
    };
  }

  async getNovelDetails({
    novelUrl,
  }: GetNovelDetailsParams): Promise<SourceNovel> {
    const sourceId = this.id;

    const res = await fetchHtml({
      url: novelUrl,
      sourceId,
    });

    const $ = cheerio.load(res);

    const statusRaw = $('div.infox > div:nth-child(3) > span').text().trim();

    const chapters: SourceChapter[] = [];

    $('#chapterlist')
      .find('li')
      .each(function () {
        const releaseDate = dayjs($(this).find('.chapterdate').text()).unix();

        const chapterName = $(this).find('.chapternum').text();
        const chapterUrl = $(this).find('a').attr('href');

        if (chapterUrl) {
          chapters.push({
            chapterName,
            chapterUrl,
            releaseDate,
          });
        }
      });

    return {
      sourceId,
      novelUrl,
      novelName: $('.entry-title').text().trim(),
      novelCover: $('div.thumbook > div > img').attr('src'),
      summary: $('div.infox > div:nth-child(6) > span > p').text().trim(),
      genre: $('div.infox > div:nth-child(4) > span').text().replace(/\s/g, ''),
      status: StatusMap[statusRaw] || NovelStatus.Unknown,
      author: $('div.infox > div:nth-child(2) > span').text().trim(),
      chapters: chapters.reverse(),
    };
  }

  async getPopoularNovels({
    page,
  }: GetPopularNovelsParams): Promise<SourceNovelsResponse> {
    const url = this.baseUrl + 'page/' + page + '/?post_type=novel';
    const sourceId = this.id;

    const res = await fetchHtml({ url, sourceId });

    const $ = cheerio.load(res);

    const novels: SourceNovel[] = [];

    $('.listupd div.bs').each(function () {
      const novelName = $(this).find('.tt').text().trim();
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

    return { novels };
  }

  async getSearchNovels({
    searchTerm,
  }: GetSearchNovelsParams): Promise<SourceNovelsResponse> {
    const url = this.baseUrl + '?s=' + searchTerm + '&post_type=novel';
    const sourceId = this.id;

    const res = await fetchHtml({ url, sourceId });

    const $ = cheerio.load(res);

    const novels: SourceNovel[] = [];

    $('.listupd')
      .find('div.bs')
      .each(function () {
        const novelName = $(this).find('.tt').text().trim();
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

    return { novels };
  }
}
