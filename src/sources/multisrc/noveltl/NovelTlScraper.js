import dayjs from 'dayjs';
import * as cheerio from 'cheerio';
import { Status } from '../../helpers/constants';
import { htmlToText } from '../../helpers/htmlToText';
import { FilterInputs } from '../../types/filterTypes';
import tags from './NovelTl.json';

class ReadwnScraper {
  constructor(sourceId, baseUrl, sourceName) {
    this.sourceId = sourceId;
    this.baseUrl = baseUrl;
    this.domain = baseUrl.split('//')[1];
    this.sourceName = sourceName;

    if (tags?.[this.domain]) {
      this.filters = tags[this.domain];
      this.filters.inputType = FilterInputs.Checkbox;
    }
  }

  async popularNovels(page, { filters }) {
    const result = await fetch('https://api.novel.tl/api/site/v2/graphql', {
      method: 'post',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Content-Type': 'application/json',
        'Alt-Used': 'api.novel.tl',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      referrer: this.baseUrl,
      body: JSON.stringify({
        operationName: 'Projects',
        query:
          'query Projects($hostname:String! $filter:SearchFilter $page:Int $limit:Int){projects(section:{fullUrl:$hostname}filter:$filter page:{pageSize:$limit,pageNumber:$page}){totalElements content{title url covers{thumbnail(width:240)__typename}__typename}__typename}}',
        variables: {
          filter: filters?.tags?.length > 0 ? { tags: filters.tags } : {},
          hostname: this.domain,
          limit: 40,
          page,
        },
      }),
    });

    const json = await result.json();
    let novels = json?.data?.projects?.content?.map(novel => ({
      novelName: novel.title,
      novelCover: this.baseUrl + novel.covers[0].thumbnail,
      novelUrl: novel.url,
      sourceId: this.sourceId,
    }));

    return { novels };
  }

  async parseNovelAndChapters(novelUrl) {
    const result = await fetch('https://api.novel.tl/api/site/v2/graphql', {
      method: 'post',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Content-Type': 'application/json',
        'Alt-Used': 'api.novel.tl',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      referrer: this.baseUrl,
      body: JSON.stringify({
        operationName: 'Book',
        query:
          'query Book($url:String){project(project:{fullUrl:$url}){id title translationStatus url covers{thumbnail(width:240)url __typename}persons(langs:["ru","en","*"]roles:["author","illustrator","original_story","original_design"]){role name{firstName lastName __typename}__typename}genres{nameRu nameEng __typename}tags{nameRu nameEng __typename}annotation{text __typename}subprojects{content{id title volumes{content{url title shortName chapters{title publishDate url __typename}__typename}__typename}__typename}__typename}__typename}}',
        variables: {
          hostname: this.domain,
          project: novelUrl,
          url: this.domain + '/r/' + novelUrl,
        },
      }),
    });
    const json = await result.json();

    let novel = {
      sourceId: this.sourceId,
      sourceName: this.sourceName,
      url: this.baseUrl + '/r/' + novelUrl,
      novelUrl,
      novelName: json.data.project.title,
      novelCover: this.baseUrl + json.data.project.covers[0].thumbnail,
      summary: htmlToText(json.data.project.annotation?.text),
      author:
        json.data.project.persons[0].name.firstName +
        ' ' +
        json.data.project.persons[0].name.lastName,
      status:
        json.data.project.translationStatus === 'active'
          ? Status.ONGOING
          : Status.COMPLETED,
    };

    let tags = []
      .concat(json.data.project.tags, json.data.project.genres)
      .map(item => item?.nameRu || item?.nameEng)
      .filter(item => item);

    if (tags.length > 0) {
      novel.genre = tags.join(',');
    }

    let novelChapters = [];
    json.data.project.subprojects.content.forEach(work =>
      work.volumes.content.forEach(volume =>
        volume.chapters.forEach(chapter =>
          novelChapters.push({
            chapterName: volume.shortName + ' ' + chapter.title,
            chapterUrl: volume.url + '/' + chapter.url,
            releaseDate: dayjs(chapter.publishDate).format('LLL'),
          }),
        ),
      ),
    );

    novel.chapters = novelChapters;
    return novel;
  }

  async parseChapter(novelUrl, chapterUrl) {
    const baseUrl = this.baseUrl;
    const sourceId = this.sourceId;
    const result = await fetch('https://api.novel.tl/api/site/v2/graphql', {
      method: 'post',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Content-Type': 'application/json',
        'Alt-Used': 'api.novel.tl',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      referrer: baseUrl,
      body: JSON.stringify({
        operationName: 'EReaderData',
        query:
          'query EReaderData($url:String!,$chapterSelector:Selector!){project(project:{fullUrl:$url}){id title url __typename}chapter(chapter:$chapterSelector){id title text{text __typename}__typename}}',
        variables: {
          chapterSelector: {
            fullUrl: this.domain + '/r/' + novelUrl + '/' + chapterUrl,
          },
          url: this.domain + '/r/' + novelUrl + '/' + chapterUrl,
        },
      }),
    });
    const json = await result.json();

    const loadedCheerio = cheerio.load(json.data.chapter.text.text);
    loadedCheerio('img').each(function () {
      if (!loadedCheerio(this).attr('src')?.startsWith('http')) {
        let src = loadedCheerio(this).attr('src');
        loadedCheerio(this).attr('src', baseUrl + src);
      }
    });

    const chapter = {
      sourceId,
      novelUrl,
      chapterUrl,
      chapterName: json.data.chapter.title,
      chapterText: loadedCheerio.html(),
    };

    return chapter;
  }

  async searchNovels(searchTerm) {
    const result = await fetch('https://api.novel.tl/api/site/v2/graphql', {
      method: 'post',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Content-Type': 'application/json',
        'Alt-Used': 'api.novel.tl',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      referrer: this.baseUrl,
      body: JSON.stringify({
        operationName: 'Projects',
        query:
          'query Projects($hostname:String! $filter:SearchFilter $page:Int $limit:Int){projects(section:{fullUrl:$hostname}filter:$filter page:{pageSize:$limit,pageNumber:$page}){totalElements content{title url covers{thumbnail(width:240)__typename}__typename}__typename}}',
        variables: {
          filter: {
            query: searchTerm,
          },
          hostname: this.domain,
          limit: 40,
          page: 1,
        },
      }),
    });
    const json = await result.json();

    let novels = json?.data?.projects?.content?.map(novel => ({
      novelName: novel.title,
      novelCover: this.baseUrl + novel.covers[0].thumbnail,
      novelUrl: novel.url,
      sourceId: this.sourceId,
    }));

    return novels;
  }
}

export default ReadwnScraper;
