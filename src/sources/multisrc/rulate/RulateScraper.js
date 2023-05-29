import { FilterInputs } from '../../types/filterTypes';
import { htmlToText } from '../../helpers/htmlToText';
import { Status } from '../../helpers/constants';
import * as cheerio from 'cheerio';

class RulateScraper {
  constructor(sourceId, baseUrl, sourceName, filter) {
    this.sourceId = sourceId;
    this.baseUrl = baseUrl;
    this.sourceName = sourceName;
    this.filters = [
      {
        key: 'sort',
        label: 'Сортировка',
        values: [
          { label: 'По рейтингу', value: '6' },
          { label: 'По степени готовности', value: '0' },
          { label: 'По названию на языке оригинала', value: '1' },
          { label: 'По названию на языке перевода', value: '2' },
          { label: 'По дате создания', value: '3' },
          { label: 'По дате последней активности', value: '4' },
          { label: 'По просмотрам', value: '5' },
          { label: 'По кол-ву переведённых глав', value: '7' },
          { label: 'По кол-ву лайков', value: '8' },
          { label: 'По кол-ву страниц', value: '10' },
          { label: 'По кол-ву бесплатных глав', value: '11' },
          { label: 'По кол-ву рецензий', value: '12' },
          { label: 'По кол-ву в закладках', value: '13' },
          { label: 'По кол-ву в избранном', value: '14' },
        ],
        inputType: FilterInputs.Picker,
      },
      {
        key: 'type',
        label: 'Тип',
        values: [
          { label: 'Неважно', value: '0' },
          { label: 'Только переводы', value: '1' },
          { label: 'Только авторские', value: '2' },
        ],
        inputType: FilterInputs.Picker,
      },
      {
        key: 'atmosphere',
        label: 'Атмосфера',
        values: [
          { label: 'Неважно', value: '0' },
          { label: 'Позитивная', value: '1' },
          { label: 'Dark', value: '2' },
        ],
        inputType: FilterInputs.Picker,
      },
      {
        key: 'trash',
        label: 'Другое',
        values: [
          { label: 'Готовые на 100%', value: 'ready' },
          { label: 'Доступные для перевода', value: 'tr' },
          { label: 'Доступные для скачивания', value: 'gen' },
          { label: 'Завершённые проекты', value: 'wealth' },
          { label: 'Распродажа', value: 'discount' },
          { label: 'Только онгоинги', value: 'ongoings' },
          { label: 'Убрать машинный', value: 'remove_machinelate' },
        ],
        inputType: FilterInputs.Checkbox,
      },
      ...filter,
      {
        key: 'adult',
        label: 'Возрастные ограничения',
        values: [
          { label: 'Все', value: '0' },
          { label: 'Убрать 18+', value: '1' },
          { label: 'Только 18+', value: '2' },
        ],
        inputType: FilterInputs.Picker,
      },
    ];
  }

  async popularNovels(page, { showLatestNovels, filters }) {
    const baseUrl = this.baseUrl;
    const sourceId = this.sourceId;
    let url = baseUrl + '/search?t=&cat=2';
    url += '&sort=' + showLatestNovels ? '4' : filters?.sort || '6';
    url += '&type=' + filters?.type || '0';
    url += '&atmosphere=' + filters?.atmosphere || '0';
    url += '&adult=' + filters?.adult || '0';

    if (filters?.genres?.length) {
      url += filters.genres.map(i => `&genres[]=${i}`).join('');
    }

    if (filters?.tags?.length) {
      url += filters.tags.map(i => `&tags[]=${i}`).join('');
    }

    if (filters?.trash?.length) {
      url += filters.trash.map(i => `&${i}=1`);
    }

    url += `&Book_page=${page}`;

    const result = await fetch(url);
    const body = await result.text();
    const loadedCheerio = cheerio.load(body);

    let novels = [];

    loadedCheerio(
      'ul[class="search-results"] > li:not([class="ad_type_catalog"])',
    ).each(function () {
      novels.push({
        sourceId,
        novelName: loadedCheerio(this).find('p > a').text(),
        novelCover: baseUrl + loadedCheerio(this).find('img').attr('src'),
        novelUrl: loadedCheerio(this).find('p > a').attr('href'),
      });
    });

    return { novels };
  }

  async parseNovelAndChapters(novelUrl) {
    let result = await fetch(this.baseUrl + novelUrl);
    if (result.url.includes('mature?path=')) {
      const formData = new FormData();
      formData.append('path', novelUrl);
      formData.append('ok', 'Да');

      await fetch(result.url, {
        method: 'POST',
        body: formData,
      });

      result = await fetch(this.baseUrl + novelUrl);
    }
    const body = await result.text();
    const loadedCheerio = cheerio.load(body);

    let novel = {
      sourceId: this.sourceId,
      sourceName: this.sourceName,
      url: this.baseUrl + novelUrl,
      novelUrl,
    };

    novel.novelName = loadedCheerio('div[class="container"] > div > div > h1')
      .text()
      .trim();
    novel.novelCover =
      this.baseUrl + loadedCheerio('div[class="images"] > div img').attr('src');
    novel.summary = loadedCheerio('#Info > div:nth-child(3)').html();
    let genre = [];

    if (novel?.summary) {
      novel.summary = htmlToText(novel.summary);
    }

    loadedCheerio('div[class="span5"] > p').each(function () {
      switch (loadedCheerio(this).find('strong').text()) {
        case 'Автор:':
          novel.author = loadedCheerio(this).find('em > a').text().trim();
          break;
        case 'Выпуск:':
          novel.status =
            loadedCheerio(this).find('em').text().trim() === 'продолжается'
              ? Status.ONGOING
              : Status.COMPLETED;
          break;
        case 'Тэги:':
          loadedCheerio(this)
            .find('em > a')
            .each(function () {
              genre.push(loadedCheerio(this).text());
            });
          break;
        case 'Жанры:':
          loadedCheerio(this)
            .find('em > a')
            .each(function () {
              genre.push(loadedCheerio(this).text());
            });
          break;
      }
    });

    if (genre.length > 0) {
      novel.genre = genre.reverse().join(',');
    }

    let chapters = [];
    loadedCheerio('table > tbody > tr.chapter_row').each(function () {
      const chapterName = loadedCheerio(this)
        .find('td[class="t"] > a')
        .text()
        .trim();
      const releaseDate = loadedCheerio(this)
        .find('td > span')
        .attr('title')
        ?.trim();
      const chapterUrl = loadedCheerio(this)
        .find('td[class="t"] > a')
        .attr('href');

      if (
        loadedCheerio(this).find('td > span[class="disabled"]').length < 1 &&
        releaseDate
      ) {
        chapters.push({ chapterName, releaseDate, chapterUrl });
      }
    });

    novel.chapters = chapters;
    return novel;
  }

  async parseChapter(novelUrl, chapterUrl) {
    const baseUrl = this.baseUrl;
    const sourceId = this.sourceId;
    let result = await fetch(baseUrl + chapterUrl);
    if (result.url.includes('mature?path=')) {
      const formData = new FormData();
      formData.append('path', novelUrl);
      formData.append('ok', 'Да');

      await fetch(result.url, {
        method: 'POST',
        body: formData,
      });

      result = await fetch(baseUrl + chapterUrl);
    }
    const body = await result.text();
    const loadedCheerio = cheerio.load(body);

    loadedCheerio('.content-text img').each(function () {
      if (!loadedCheerio(this).attr('src')?.startsWith('http')) {
        let src = loadedCheerio(this).attr('src');
        loadedCheerio(this).attr('src', baseUrl + src);
      }
    });

    const chapterName = loadedCheerio(
      '.chapter_select > select > option[selected]',
    )
      .text()
      .trim();
    const chapterText = loadedCheerio('.content-text').html();

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
    const result = await fetch(
      this.baseUrl + '/search/autocomplete?query=' + searchTerm,
    );
    let json = await result.json();
    let novels = [];

    json.forEach(item => {
      const novelName = item.title_one + ' / ' + item.title_two;
      const novelCover = this.baseUrl + item.img;
      const novelUrl = item.url;

      novels.push({ sourceId: this.sourceId, novelName, novelCover, novelUrl });
    });

    return novels;
  }
}

export default RulateScraper;
