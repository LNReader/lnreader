import moment from 'moment';
import cheerio from 'react-native-cheerio';
import {defaultCoverUri, Status} from '../../helpers/constants';
import {parseMadaraDate} from '../../helpers/parseDate';

class MadaraScraper {
  constructor(
    sourceId,
    baseUrl,
    sourceName,
    path,
    useNewChapterEndpoint = false,
    totalPages = 100,
  ) {
    this.sourceId = sourceId;
    this.baseUrl = baseUrl;
    this.sourceName = sourceName;
    this.path = path;
    this.useNewChapterEndpoint = useNewChapterEndpoint;
    this.totalPages = totalPages;
  }

  async popularNovels(page) {
    let url =
      this.baseUrl + this.path.novels + '/page/' + page + '/?m_orderby=rating';
    let sourceId = this.sourceId;

    const result = await fetch(url);
    const body = await result.text();

    const loadedCheerio = cheerio.load(body);

    let novels = [];

    loadedCheerio('.manga-title-badges').remove();

    loadedCheerio('.page-item-detail').each(function () {
      const novelName = loadedCheerio(this).find('.post-title').text().trim();
      let image = loadedCheerio(this).find('img');
      const novelCover = image.attr('data-src') || image.attr('src');

      let novelUrl = loadedCheerio(this)
        .find('.post-title')
        .find('a')
        .attr('href')
        .split('/')[4];

      const novel = {
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    });

    return {totalPages: this.totalPages, novels};
  }

  async parseNovelAndChapters(novelUrl) {
    const url = `${this.baseUrl}${this.path.novel}/${novelUrl}/`;

    const result = await fetch(url);
    const body = await result.text();

    let loadedCheerio = cheerio.load(body);

    let novel = {};

    novel.sourceId = this.sourceId;

    novel.sourceName = this.sourceName;

    novel.url = url;

    novel.novelUrl = novelUrl;

    loadedCheerio('.manga-title-badges').remove();

    novel.novelName = loadedCheerio('.post-title > h1').text().trim();

    novel.novelCover =
      loadedCheerio('.summary_image > a > img').attr('data-src') ||
      loadedCheerio('.summary_image > a > img').attr('src') ||
      defaultCoverUri;

    loadedCheerio('.post-content_item').each(function () {
      const detailName = loadedCheerio(this)
        .find('.summary-heading > h5')
        .text()
        .trim();
      const detail = loadedCheerio(this).find('.summary-content').text().trim();

      switch (detailName) {
        case 'Genre(s)':
          novel.genre = detail.replace(/[\t\n]/g, ',');
          break;
        case 'Author(s)':
          novel.author = detail;
          break;
        case 'Status':
          novel.status = detail.includes('OnGoing')
            ? Status.ONGOING
            : Status.COMPLETED;
          break;
      }
    });

    novel.summary = loadedCheerio('div.summary__content').text().trim();

    let novelChapters = [];

    let html;

    if (this.useNewChapterEndpoint === false) {
      const novelId =
        loadedCheerio('.rating-post-id').attr('value') ||
        loadedCheerio('#manga-chapters-holder').attr('data-id');

      let formData = new FormData();
      formData.append('action', 'manga_get_chapters');
      formData.append('manga', novelId);

      const data = await fetch(this.baseUrl + 'wp-admin/admin-ajax.php', {
        method: 'POST',
        body: formData,
      });
      html = await data.text();
    } else {
      const data = await fetch(url + 'ajax/chapters/', {method: 'POST'});
      html = await data.text();
    }

    if (html !== '0') {
      loadedCheerio = cheerio.load(html);
    }

    loadedCheerio('.wp-manga-chapter').each(function () {
      const chapterName = loadedCheerio(this)
        .find('a')
        .text()
        .replace(/[\t\n]/g, '')
        .trim();

      let releaseDate = null;
      releaseDate = loadedCheerio(this)
        .find('span.chapter-release-date')
        .text()
        .trim();

      if (releaseDate) {
        releaseDate = parseMadaraDate(releaseDate);
      } else {
        /**
         * Insert current date
         */

        releaseDate = moment().format('MMMM DD, YYYY');
      }

      let chapterUrl = loadedCheerio(this).find('a').attr('href').split('/');

      chapterUrl[6]
        ? (chapterUrl = chapterUrl[5] + '/' + chapterUrl[6])
        : (chapterUrl = chapterUrl[5]);

      novelChapters.push({chapterName, releaseDate, chapterUrl});
    });

    novel.chapters = novelChapters.reverse();

    return novel;
  }

  async parseChapter(novelUrl, chapterUrl) {
    let sourceId = this.sourceId;

    const url = `${this.baseUrl}${this.path.chapter}/${novelUrl}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    const loadedCheerio = cheerio.load(body);

    let chapterName =
      loadedCheerio('.text-center').text() ||
      loadedCheerio('#chapter-heading').text();

    let chapterText = loadedCheerio('.text-left').html();

    const chapter = {
      sourceId,
      novelUrl,
      chapterUrl,
      chapterName,
      chapterText,
    };

    return chapter;
  }

  async searchNovels(searchTerm) {
    const url = `${this.baseUrl}?s=${searchTerm}&post_type=wp-manga`;

    const result = await fetch(url);
    const body = await result.text();

    const loadedCheerio = cheerio.load(body);

    let novels = [];
    let sourceId = this.sourceId;

    loadedCheerio('.c-tabs-item__content').each(function () {
      const novelName = loadedCheerio(this).find('.post-title').text().trim();

      let image = loadedCheerio(this).find('img');
      const novelCover = image.attr('data-src') || image.attr('src');

      let novelUrl = loadedCheerio(this)
        .find('.post-title')
        .find('a')
        .attr('href')
        .split('/')[4];

      const novel = {
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    });

    return novels;
  }
}

export default MadaraScraper;
