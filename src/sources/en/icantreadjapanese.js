import { fetchHtml } from '@utils/fetch/fetch';
import * as cheerio from 'cheerio';
import { FilterInputs } from '../types/filterTypes';

const sourceId = 170;
const sourceName = 'I cant read japanese tl';

const baseUrl = 'https://icantreadjapanese.wordpress.com/';

const popularNovels = async (page, { filters }) => {
  let link = `${baseUrl}`;

  if (page === 1) {
    link += (filters?.storyStatus ? filters.storyStatus : 'projects') + '/';
  }

  const body = await fetchHtml({ url: link, sourceId });

  const loadedCheerio = cheerio.load(body);

  let novels = [];

  loadedCheerio('figure.wp-block-image').each(function () {
    const novelName = loadedCheerio(this).find('a').text();
    const novelCover = loadedCheerio(this).find('img').attr('src');
    const novelUrl = loadedCheerio(this).find('a').attr('href');

    const novel = { sourceId, novelName, novelCover, novelUrl };

    novels.push(novel);
  });

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const body = await fetchHtml({ url: novelUrl, sourceId: sourceId });

  let loadedCheerio = cheerio.load(body);

  let novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
  };

  novel.novelName = loadedCheerio('h1.entry-title').text().trim();

  novel.novelCover = loadedCheerio('figure.wp-block-image > img').attr('src');

  novel.author = loadedCheerio('.has-text-align-left')
    .text()
    .replace(/.*Author: (.*) \|.*/g, '$1');

  novel.summary = loadedCheerio('.entry-content > p:first')
    .nextUntil('hr:first')
    .text();

  let chapters = [];

  loadedCheerio('.wp-block-column li a').each(function () {
    let chapterName = loadedCheerio(this).text();
    const releaseDate = null;
    const chapterUrl = loadedCheerio(this).attr('href');

    const volumeName = loadedCheerio(this)
      .parent()
      .prop('innerHTML')
      .replace(/<a.*>/g, '')
      .replace(/<br>/g, ' ')
      .trim();
    if (volumeName.length) {
      chapterName = volumeName + ' - ' + chapterName;
    }

    chapters.push({ chapterName, releaseDate, chapterUrl });
  });

  novel.chapters = chapters;
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const body = await fetchHtml({
    url: chapterUrl,
    sourceId: sourceId,
  });

  let loadedCheerio = cheerio.load(body);

  const chapterName = loadedCheerio('h1.entry-title').text();

  const chapterText = loadedCheerio('.entry-content').html();

  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async () => {
  showToast('Search is not implemented for this source');
  return;
};

const filters = [
  {
    key: 'storyStatus',
    label: 'Translation Status',
    values: [
      { label: 'Ongoing Projects', value: 'projects' },
      {
        label: 'Maybe Will Read Again, Caught Up',
        value: 'maybe-will-read-again-caught-up',
      },
      { label: 'Dropped', value: 'dropped' },
      { label: 'Finished', value: 'finished' },
    ],
    inputType: FilterInputs.Picker,
  },
];

const ICantReadJPTLScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default ICantReadJPTLScraper;
