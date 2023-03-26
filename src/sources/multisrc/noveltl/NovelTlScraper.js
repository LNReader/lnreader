import * as cheerio from 'cheerio';
import { Status } from '../../helpers/constants';
import { htmlToText } from '../../helpers/htmlToText';

class ReadwnScraper {
  constructor(sourceId, baseUrl, sourceName) {
    this.sourceId = sourceId;
    this.baseUrl = baseUrl;
    this.domain = baseUrl.split('//')[1];
    this.sourceName = sourceName;
  }

  async popularNovels(page) {
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
          'query Projects($hostname: String!, $withBanners: Boolean!, $filter: SearchFilter, $page: Int, $limit: Int) {  projects(section: {fullUrl: $hostname}, filter: $filter, page: {pageSize: $limit, pageNumber: $page}) {    totalElements    content {      ...bannerFields @include(if: $withBanners)      ...coverFields @skip(if: $withBanners)      __typename    }    __typename  }}fragment bannerFields on Project {  id  url  title  issueStatus  main  translationStatus  banner {    url    __typename  }  volumes {    totalElements    __typename  }  lastUpdate  rating {    rating    voteCount    __typename  }  __typename}fragment coverFields on Project {  title  url  covers {    thumbnail(width: 240)    __typename  }  main  shortDescription  rating {    rating    voteCount    __typename  }  __typename}',
        variables: {
          filter: {},
          hostname: this.domain,
          withBanners: false,
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
          'query Book($url: String) {  project(project: {fullUrl: $url}) {    id    title    titles(langs: ["jp", "cn", "romaji", "translit", "pinyin", "en", "ru", "*"]) {      lang      value      __typename    }    issueStatus    translationStatus    lastUpdate    url    franchiseNovel    franchiseSpinOff    franchiseSS    franchiseManga    franchiseAnime    franchiseWeb    oneVolume    covers {      thumbnail(width: 240)      url      __typename    }    rating {      rating      voteCount      __typename    }    persons(langs: ["ru", "en", "*"], roles: ["author", "illustrator", "original_story", "original_design"]) {      role      name {        firstName        lastName        __typename      }      __typename    }    genres {      id      type      nameRu      nameEng      __typename    }    tags {      id      type      nameRu      nameEng      __typename    }    annotation {      text      __typename    }    subprojects {      content {        id        title        volumes {          content {            url            externalUrl            file            title            type            shortName            status            statusHint            chapters {              url              __typename            }            __typename          }          __typename        }        __typename      }      __typename    }    requisites {      title      qiwi      wmr      wmu      wmz      wme      wmb      wmg      wmk      wmx      yandex      showYandexMoneyButton      showYandexCardButton      showYandexMobileButton      paypal      paypalButtonId      card      bitcoin      patreonUrl      patreonBePatronUserId      boostyUrl      sbpPhoneNumber      custom      __typename    }    updates {      content {        type        showTime        description        url        title        updated        shortUpdated        sectionId        projectId        volumeId        chapterId        main        __typename      }      __typename    }    __typename  }}',
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
        volume.chapters.forEach((chapter, i) =>
          novelChapters.push({
            chapterName: `${volume.shortName} Глава ${i + 1}`,
            chapterUrl: volume.url + '/' + chapter.url,
          }),
        ),
      ),
    );

    novel.chapters = novelChapters;
    return novel;
  }

  async parseChapter(novelUrl, chapterUrl) {
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
        operationName: 'EReaderData',
        query:
          'query EReaderData($url: String!, $chapterSelector: Selector!) {  project(project: {fullUrl: $url}) {    id    title    url    __typename  }  volume(volume: {fullUrl: $url}) {    type    title    shortName    url    topicId    prev {      url      title      shortTitle      __typename    }    next {      url      title      shortTitle      __typename    }    chapters {      id      parentChapterId      url      title      published      __typename    }    __typename  }  chapter(chapter: $chapterSelector) {    ...chapterInfo    __typename  }}fragment chapterInfo on Chapter {  id  title  url  next {    url    __typename  }  text {    text    __typename  }  published  __typename}',
        variables: {
          chapterSelector: {
            fullUrl: this.domain + '/r/' + novelUrl + '/' + chapterUrl,
          },
          url: this.domain + '/r/' + novelUrl + '/' + chapterUrl,
        },
      }),
    });
    const json = await result.json();

    const loadedCheerio = cheerio.load(json.data.chapter.text);
    loadedCheerio('img').each(function () {
      if (!loadedCheerio(this).attr('src')?.startsWith('http')) {
        let src = loadedCheerio(this).attr('src');
        loadedCheerio(this).attr('src', this.baseUrl + src);
      }
    });

    const chapter = {
      sourceId: this.sourceId,
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
          'query Projects($hostname: String!, $withBanners: Boolean!, $filter: SearchFilter, $page: Int, $limit: Int) {  projects(section: {fullUrl: $hostname}, filter: $filter, page: {pageSize: $limit, pageNumber: $page}) {    totalElements    content {      ...bannerFields @include(if: $withBanners)      ...coverFields @skip(if: $withBanners)      __typename    }    __typename  }}fragment bannerFields on Project {  id  url  title  issueStatus  main  translationStatus  banner {    url    __typename  }  volumes {    totalElements    __typename  }  lastUpdate  rating {    rating    voteCount    __typename  }  __typename}fragment coverFields on Project {  title  url  covers {    thumbnail(width: 240)    __typename  }  main  shortDescription  rating {    rating    voteCount    __typename  }  __typename}',
        variables: {
          filter: {
            query: searchTerm,
          },
          hostname: this.domain,
          withBanners: false,
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
