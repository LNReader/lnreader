import * as cheerio from 'cheerio';
import QueryString from 'qs';

import { parseMadaraDate } from '../../helpers/parseDate';
import { FilterInputs } from '../../types/filterTypes';
import { Status } from '../../helpers/constants';
import { fetchHtml } from '@utils/fetch/fetch';

class ReadwnScraper {
  constructor(sourceId, baseUrl, sourceName, genres) {
    this.sourceId = sourceId;
    this.baseUrl = baseUrl;
    this.sourceName = sourceName;
    this.filters = [
      {
        key: 'sort',
        label: 'Sort By',
        values: [
          { label: 'New', value: 'newstime' },
          { label: 'Popular', value: 'onclick' },
          { label: 'Updates', value: 'lastdotime' },
        ],
        inputType: FilterInputs.Picker,
      },
      {
        key: 'status',
        label: 'Status',
        values: [
          { label: 'All', value: 'all' },
          { label: 'Completed', value: 'Completed' },
          { label: 'Ongoing', value: 'Ongoing' },
        ],
        inputType: FilterInputs.Picker,
      },
      {
        key: 'genres',
        label: 'Genre / Category',
        values: [
          { label: 'All', value: 'all' },
          { label: 'Action', value: 'action' },
          { label: 'Adventure', value: 'adventure' },
          { label: 'Comedy', value: 'comedy' },
          { label: 'Contemporary Romance', value: 'contemporary-romance' },
          { label: 'Drama', value: 'drama' },
          { label: 'Eastern Fantasy', value: 'eastern-fantasy' },
          { label: 'Fantasy', value: 'fantasy' },
          { label: 'Fantasy Romance', value: 'fantasy-romance' },
          { label: 'Game', value: 'game' },
          { label: 'Gender Bender', value: 'gender-bender' },
          { label: 'Harem', value: 'harem' },
          { label: 'Historical', value: 'historical' },
          { label: 'Horror', value: 'horror' },
          { label: 'Josei', value: 'josei' },
          { label: 'Lolicon', value: 'lolicon' },
          { label: 'Magical Realism', value: 'magical-realism' },
          { label: 'Martial Arts', value: 'martial-arts' },
          { label: 'Mecha', value: 'mecha' },
          { label: 'Mystery', value: 'mystery' },
          { label: 'Psychological', value: 'psychological' },
          { label: 'Romance', value: 'romance' },
          { label: 'School Life', value: 'school-life' },
          { label: 'Sci-fi', value: 'sci-fi' },
          { label: 'Seinen', value: 'seinen' },
          { label: 'Shoujo', value: 'shoujo' },
          { label: 'Shounen', value: 'shounen' },
          { label: 'Shounen Ai', value: 'shounen-ai' },
          { label: 'Slice of Life', value: 'slice-of-life' },
          { label: 'Sports', value: 'sports' },
          { label: 'Supernatural', value: 'supernatural' },
          { label: 'Tragedy', value: 'tragedy' },
          { label: 'Video Games', value: 'video-games' },
          { label: 'Wuxia', value: 'wuxia' },
          { label: 'Xianxia', value: 'xianxia' },
          { label: 'Xuanhuan', value: 'xuanhuan' },
          { label: 'Yaoi', value: 'yaoi' },
          ...genres.values,
        ],
        inputType: FilterInputs.Picker,
      },
    ];
  }

  async popularNovels(page, { showLatestNovels, filters }) {
    let url = this.baseUrl + 'list/';
    url += (filters?.genres || 'all') + '/';
    url += (filters?.status || 'all') + '-';
    url +=
      (showLatestNovels ? 'lastdotime' : filters?.sort || 'newstime') + '-';
    url += page - 1 + '.html';

    const body = await fetchHtml({ url, sourceId: this.sourceId });

    const loadedCheerio = cheerio.load(body);
    const novels = loadedCheerio('li.novel-item')
      .map((index, element) => ({
        sourceId: this.sourceId,
        novelName: loadedCheerio(element).find('h4').text(),
        novelCover:
          this.baseUrl +
          loadedCheerio(element).find('.novel-cover > img').attr('data-src'),
        novelUrl: this.baseUrl + loadedCheerio(element).find('a').attr('href'),
      }))
      .get();

    return { novels };
  }

  async parseNovelAndChapters(novelUrl) {
    const body = await fetchHtml({ url: novelUrl, sourceId: this.sourceId });
    const loadedCheerio = cheerio.load(body);

    const novel = {
      sourceId: this.sourceId,
      sourceName: this.sourceName,
      url: novelUrl,
      novelUrl,
    };

    novel.novelName = loadedCheerio('h1.novel-title').text();
    novel.novelCover =
      this.baseUrl + loadedCheerio('figure.cover > img').attr('data-src');
    novel.author = loadedCheerio('span[itemprop=author]').text();

    novel.summary = loadedCheerio('.summary')
      .text()
      .replace('Summary', '')
      .trim();

    novel.genre = loadedCheerio('div.categories > ul > li')
      .map((index, element) => loadedCheerio(element).text()?.trim())
      .get()
      .join(',');

    loadedCheerio('div.header-stats > span').each(function () {
      if (loadedCheerio(this).find('small').text() === 'Status') {
        novel.status =
          loadedCheerio(this).find('strong').text() === 'Ongoing'
            ? Status.ONGOING
            : Status.COMPLETED;
      }
    });

    const latestChapterNo = parseInt(
      loadedCheerio('.header-stats')
        .find('span > strong')
        .first()
        .text()
        .trim(),
      10,
    );

    const chapters = loadedCheerio('.chapter-list li')
      .map((index, element) => {
        const chapterName = loadedCheerio(element)
          .find('a .chapter-title')
          .text()
          .trim();
        const chapterUrl = loadedCheerio(element)
          .find('a')
          .attr('href')
          ?.trim();
        const releaseDate = loadedCheerio(element)
          .find('a .chapter-update')
          .text()
          .trim();

        if (chapterUrl) {
          return {
            chapterName,
            releaseDate: parseMadaraDate(releaseDate),
            chapterUrl: this.baseUrl + chapterUrl,
          };
        }
      })
      .get()
      .filter(chapter => chapter?.chapterName);

    if (latestChapterNo > chapters.length) {
      const lastChapterNo = parseInt(
        chapters[chapters.length - 1].chapterUrl.match(/_(\d+)\.html/)?.[1] ||
          chapters.length,
        10,
      );

      for (let i = lastChapterNo + 1; i <= latestChapterNo; i++) {
        chapters.push({
          chapterName: 'Chapter ' + i,
          releaseDate: null,
          chapterUrl: novelUrl.replace('.html', '_' + i + '.html'),
        });
      }
    }
    novel.chapters = chapters;

    return novel;
  }

  async parseChapter(novelUrl, chapterUrl) {
    const body = await fetchHtml({ url: chapterUrl, sourceId: this.sourceId });

    const loadedCheerio = cheerio.load(body);
    const chapterName = loadedCheerio('.titles > h2').text();
    const chapterText = loadedCheerio('.chapter-content').html();

    const chapter = {
      sourceId: this.sourceId,
      novelUrl,
      chapterUrl,
      chapterName,
      chapterText,
    };

    return chapter;
  }

  async searchNovels(searchTerm) {
    const body = await fetchHtml({
      url: this.baseUrl + 'e/search/index.php',
      sourceId: this.sourceId,
      init: {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: this.baseUrl + 'search.html',
          Origin: this.baseUrl,
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
        },
        method: 'POST',
        body: QueryString.stringify({
          show: 'title',
          tempid: 1,
          tbname: 'news',
          keyboard: searchTerm,
        }),
      },
    });

    const loadedCheerio = cheerio.load(body);
    const novels = loadedCheerio('li.novel-item')
      .map((index, element) => ({
        sourceId: this.sourceId,
        novelName: loadedCheerio(element).find('h4').text(),
        novelCover:
          this.baseUrl + loadedCheerio(element).find('img').attr('data-src'),
        novelUrl: this.baseUrl + loadedCheerio(element).find('a').attr('href'),
      }))
      .get();

    return novels;
  }
}

export default ReadwnScraper;
