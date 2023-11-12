import * as cheerio from 'cheerio';
import dayjs from 'dayjs';

import {
  FilterInput,
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
import { fetchApi, fetchHtml } from '@utils/fetch/fetch';
import { defaultTo } from 'lodash-es';

const baseUrl = 'https://www.novelupdates.com/';

interface NovelUpdatesFilters {
  novelType?: string[];
  genres?: string[];
  language?: string[];
  storyStatus?: string;
}

const StatusMap: Record<string, NovelStatus> = {
  'Completed': NovelStatus.Completed,
  'Ongoing': NovelStatus.Ongoing,
  'Hiatus': NovelStatus.OnHiatus,
};

function getAbsoluteUrl(href: string) {
  const match = href.match(
    /^(https?:)\/\/(([^:/?#]*)(?::([0-9]+))?)([/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/,
  );

  return match && `${match[1]}//${match[3]}`;
}

const getPopoularNovelsUrl = ({
  page,
  showLatest,
  filters,
}: GetPopularNovelsParams & { filters?: NovelUpdatesFilters }) => {
  let url = `${baseUrl}${
    filters ? 'series-finder' : showLatest ? 'latest-series' : 'series-ranking'
  }/`;

  if (!filters) {
    url += '?rank=week';
  } else {
    url += '?sf=1';

    if (filters.novelType?.length) {
      url += '&nt=' + filters.novelType.join(',');
    }

    if (filters.genres?.length) {
      url += '&gi=' + filters.genres.join(',') + '&mgi=and';
    }

    if (filters.language?.length) {
      url += '&org=' + filters.language.join(',');
    }

    if (filters.storyStatus) {
      url += '&ss=' + filters.storyStatus;
    }
  }

  url += '&sort=' + defaultTo(filters?.sort, 'sdate');

  url += '&order=' + defaultTo(filters?.order, 'desc');

  url += '&pg=' + page;

  return url;
};

export class NovelUpdatesParser implements ParsedSource {
  id = 50;

  name = 'Novel Updates';

  iconUrl =
    'https://github.com/LNReader/lnreader-sources/blob/main/icons/src/en/novelupdates/icon.png?raw=true';

  baseUrl = baseUrl;

  lang = 'en';

  async getChapter({ chapterUrl }: GetChapterParams): Promise<SourceChapter> {
    const sourceId = this.id;

    const res = await fetchApi({
      url: chapterUrl,
      init: {
        method: 'GET',
      },
      sourceId,
    });
    const body = await res.text();

    const $ = cheerio.load(body);

    const actualUrl = res.url.toLowerCase();

    let chapterName = '';
    let chapterText;

    const wordPressElement =
      $('meta[name="generator"]').attr('content') || $('footer').text();
    let isWordPress;

    if (wordPressElement) {
      isWordPress =
        wordPressElement.toLowerCase().includes('wordpress') ||
        wordPressElement.includes('Site Kit by Google') ||
        $('.powered-by').text().toLowerCase().includes('wordpress');
    }

    if (actualUrl.includes('wuxiaworld')) {
      chapterText = $('#chapter-content').html();
    } else if (actualUrl.includes('rainofsnow')) {
      chapterText = $('div.content').html();
    } else if (actualUrl.includes('tumblr')) {
      chapterText = $('.post').html();
    } else if (actualUrl.includes('blogspot')) {
      $('.post-share-buttons').remove();
      chapterText = $('.entry-content').html();
    } else if (actualUrl.includes('hostednovel')) {
      chapterText = $('.chapter').html();
    } else if (actualUrl.includes('scribblehub')) {
      chapterText = $('div.chp_raw').html();
    } else if (actualUrl.includes('wattpad')) {
      chapterText = $('.container  pre').html();
    } else if (actualUrl.includes('travistranslations')) {
      chapterText = $('.reader-content').html();
    } else if (actualUrl.includes('lightnovelstranslations')) {
      chapterText = $('.text_story').html();
    } else if (actualUrl.includes('webnovel')) {
      chapterText = $('.cha-words').html() || $('._content').html();
    } else if (actualUrl.includes('inoveltranslation')) {
      const apiUrl = 'https://api.' + res.url.slice(8);
      const chapterJson = await fetchApi({
        url: apiUrl,
        sourceId,
      }).then(result => result.json());
      chapterText = chapterJson.content.replace(/\n/g, '<br>');

      if (chapterJson.notes) {
        chapterText +=
          '<br><hr><br>TL Notes:<br>' +
          chapterJson.notes.replace(/\n/g, '<br>');
      }
    } else if (isWordPress) {
      const bloatClasses = [
        '.c-ads',
        '#madara-comments',
        '#comments',
        '.content-comments',
        '.sharedaddy',
        '.wp-dark-mode-switcher',
        '.wp-next-post-navi',
        '.wp-block-buttons',
        '.wp-block-columns',
        '.post-cats',
        '.sidebar',
        '.author-avatar',
        '.ezoic-ad',
      ];

      bloatClasses.forEach(tag => $(tag).remove());

      chapterText =
        $('.entry-content').html() ||
        $('.single_post').html() ||
        $('.post-entry').html() ||
        $('.main-content').html() ||
        $('article.post').html() ||
        $('.content').html() ||
        $('#content').html() ||
        $('.page-body').html() ||
        $('.td-page-content').html();
    } else {
      const bloatSelectors = [
        'nav',
        'header',
        'footer',
        '.hidden',
        '#comments',
      ];
      bloatSelectors.forEach(tag => $(tag).remove());

      chapterText = $('body').html();
    }

    if (chapterText) {
      /**
       * Convert Relative URLs to Absolute
       */
      chapterText = chapterText.replace(
        /href="\//g,
        `href="${getAbsoluteUrl(res.url)}/`,
      );
    }

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

    let chapters: SourceChapter[] = [];

    const novelId = $('input#mypostid').attr('value');

    if (novelId) {
      let formData = new FormData();
      formData.append('action', 'nd_getchapters');
      formData.append('mygrr', 0);
      formData.append('mypostid', Number(novelId));

      const chaptersHtml = await fetchHtml({
        url: `${baseUrl}wp-admin/admin-ajax.php`,
        init: {
          method: 'POST',
          body: formData,
        },
        sourceId,
      });

      const $Chapters = cheerio.load(chaptersHtml);

      $Chapters('li.sp_li_chp').each(function () {
        const chapterName = $Chapters(this).text().trim();
        const releaseDate = null;

        const chapterUrl =
          'https:' + $Chapters(this).find('a').first().next().attr('href');

        chapters.push({
          chapterName,
          releaseDate,
          chapterUrl,
        });
      });
    }

    return {
      sourceId,
      novelUrl,
      novelName: $('.seriestitlenu').text(),
      novelCover: $('.seriesimg > img').attr('src'),
      summary: $('#editdescription').text().trim(),
      genre: $('#seriesgenre')
        .children('a')
        .map((i, el) => $(el).text())
        .toArray()
        .join(','),
      status: StatusMap[$('#editstatus').text()],
      author: $('#showauthors').text().trim(),
      chapters: chapters.reverse(),
    };
  }

  async getPopoularNovels({
    page,
    filters,
    showLatest,
  }: GetPopularNovelsParams): Promise<SourceNovelsResponse> {
    const url = getPopoularNovelsUrl({ page, showLatest, filters });
    const sourceId = this.id;

    const res = await fetchHtml({
      url,
      sourceId,
    });

    const $ = cheerio.load(res);

    const novels: SourceNovel[] = [];

    $('div.search_main_box_nu').each(function () {
      const novelCover = $(this).find('img').attr('src');
      const novelName = $(this).find('.search_title > a').text();
      const novelUrl = $(this).find('.search_title > a').attr('href');

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
    const url = this.baseUrl + '?s=' + searchTerm + '&post_type=seriesplans';
    const sourceId = this.id;

    const res = await fetchHtml({
      url,
      sourceId,
    });

    const $ = cheerio.load(res);

    const novels: SourceNovel[] = [];

    $('div.search_main_box_nu').each(function () {
      const novelCover = $(this).find('img').attr('src');
      const novelName = $(this).find('.search_title > a').text();
      const novelUrl = $(this).find('.search_title > a').attr('href');

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

  filters = [
    {
      key: 'sort',
      label: 'Sort Results By',
      values: [
        { label: 'Last Updated', value: 'sdate' },
        { label: 'Rating', value: 'srate' },
        { label: 'Rank', value: 'srank' },
        { label: 'Reviews', value: 'sreview' },
        { label: 'Chapters', value: 'srel' },
        { label: 'Title', value: 'abc' },
        { label: 'Readers', value: 'sread' },
        { label: 'Frequency', value: 'sfrel' },
      ],
      inputType: FilterInput.Picker,
    },
    {
      key: 'order',
      label: 'Order',
      values: [
        { label: 'Descending', value: 'desc' },
        { label: 'Ascending', value: 'asc' },
      ],
      inputType: FilterInput.Picker,
    },
    {
      key: 'storyStatus',
      label: 'Story Status (Translation)',
      values: [
        { label: 'All', value: '' },
        { label: 'Completed', value: '2' },
        { label: 'Ongoing', value: '3' },
        { label: 'Hiatus', value: '4' },
      ],
      inputType: FilterInput.Picker,
    },
    {
      key: 'language',
      label: 'Language',
      values: [
        { label: 'Chinese', value: 495 },
        { label: 'Filipino', value: 9181 },
        { label: 'Indonesian', value: 9179 },
        { label: 'Japanese', value: 496 },
        { label: 'Khmer', value: 18657 },
        { label: 'Korean', value: 497 },
        { label: 'Malaysian', value: 9183 },
        { label: 'Thai', value: 9954 },
        { label: 'Vietnamese', value: 9177 },
      ],
      inputType: FilterInput.Checkbox,
    },
    {
      key: 'novelType',
      label: 'Novel Type',
      values: [
        { label: 'Light Novel', value: '2443' },
        { label: 'Published Novel', value: '26874' },
        { label: 'Web Novel', value: '2444' },
      ],
      inputType: FilterInput.Checkbox,
    },
    {
      key: 'genres',
      label: 'Genres',
      values: [
        { label: 'Action', value: 8 },
        { label: 'Adult', value: 280 },
        { label: 'Adventure', value: 13 },
        { label: 'Comedy', value: 17 },
        { label: 'Drama', value: 9 },
        { label: 'Ecchi', value: 292 },
        { label: 'Fantasy', value: 5 },
        { label: 'Gender Bender', value: 168 },
        { label: 'Harem', value: 3 },
        { label: 'Historical', value: 330 },
        { label: 'Horror', value: 343 },
        { label: 'Josei', value: 324 },
        { label: 'Martial Arts', value: 14 },
        { label: 'Mature', value: 4 },
        { label: 'Mecha', value: 10 },
        { label: 'Mystery', value: 245 },
        { label: 'Psychoical', value: 486 },
        { label: 'Romance', value: 15 },
        { label: 'School Life', value: 6 },
        { label: 'Sci-fi', value: 11 },
        { label: 'Seinen', value: 18 },
        { label: 'Shoujo', value: 157 },
        { label: 'Shoujo Ai', value: 851 },
        { label: 'Shounen', value: 12 },
        { label: 'Shounen Ai', value: 1692 },
        { label: 'Slice of Life', value: 7 },
        { label: 'Smut', value: 281 },
        { label: 'Sports', value: 1357 },
        { label: 'Supernatural', value: 16 },
        { label: 'Tragedy', value: 132 },
        { label: 'Wuxia', value: 479 },
        { label: 'Xianxia', value: 480 },
        { label: 'Xuanhuan', value: 3954 },
        { label: 'Yaoi', value: 560 },
        { label: 'Yuri', value: 922 },
      ],
      inputType: FilterInput.Checkbox,
    },
  ];
}
