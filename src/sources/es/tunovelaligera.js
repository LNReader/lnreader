// Script para tunovelaligera.com
// Basado en el script de novelonlinefull.com
// Autor: Bing

const cheerio = require("cheerio");
const { parseHtmlEntities } = require("html-entities-parser");
const { default: PQueue } = require("p-queue");

const sourceId = 100;
const sourceName = "TuNovelaLigera";
const sourceUrl = "https://tunovelaligera.com/";

const sourceLanguage = "es";

const novelSourceIdKey = "novelSourceId";
const novelUrlKey = "novelUrl";
const chapterUrlKey = "chapterUrl";

const getNovels = async (page) => {
  const url = `${sourceUrl}page/${page}/?s&post_type=wp-manga&adult=yes`;

  const result = await fetch(url);
  const body = await result.text();

  const $ = cheerio.load(body);

  const novels = [];

  $(".c-tabs-item__content").each(function (result) {
    const novelName = $(this).find(".h4 > a").text().trim();
    const novelCover = $(this).find("img").attr("src");

    let novelUrl = $(this).find(".h4 > a").attr("href");
    novelUrl = new URL(novelUrl);
    novelUrl = `${novelUrl.origin}${novelUrl.pathname}`;

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
      [novelUrlKey]: novelUrl,
    };

    novels.push(novel);
  });

  return novels;
};

const getNovel = async (novelUrl) => {
  const url = novelUrl;

  const result = await fetch(url);
  const body = await result.text();

  const $ = cheerio.load(body);

  const novel = {};

  novel.sourceId = sourceId;

  novel.sourceName = sourceName;

  novel.url = url;

  novel.novelUrl = url;

  novel.novelName = $(".post-title > h1").text().trim();

  novel.novelCover = $(".summary_image > a > img").attr("src");

  novel.summary = $(".description-summary > div.summary__content")
    .text()
    .trim();

  novel.status = $(".post-status > .summary-item")
    .find(".summary-content")
    .text()
    .trim();

  novel.genre = $(".genres-content > a")
    .map(function () {
      return $(this).text().trim();
    })
    .get();

  novel.author = $(".author-content > a")
    .map(function () {
      return $(this).text().trim();
    })
    .get();

  novel.artist = $(".artist-content > a")
    .map(function () {
      return $(this).text().trim();
    })
    .get();

  novel.release = "";

  novel.chapterCount = 0;

  const novelId = url.split("/").pop();

  novel[novelSourceIdKey] = novelId;

  const chapters = [];

  $(".wp-manga-chapter > a").each(function (result) {
    const chapterName = $(this).text().trim();
    const releaseDate = null;
    let chapterUrl = $(this).attr("href");
    chapterUrl = new URL(chapterUrl);
    chapterUrl = `${chapterUrl.origin}${chapterUrl.pathname}`;

    const chapter = {
      sourceId,
      novelUrl,
      chapterName,
      releaseDate,
      chapterUrl,
      [chapterUrlKey]: chapterUrl,
    };

    chapters.push(chapter);
  });

  novel.chapters = chapters.reverse();

  return novel;
};

const getChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  const result = await fetch(url);
  const body = await result.text();

  const $ = cheerio.load(body);

  let chapterName = $(".text-left > .h4").text().trim();
  let chapterText = $(".reading-content").html();
  chapterText = parseHtmlEntities(chapterText);

  const chapter = {
    sourceId,
    novelUrl,
    chapterName,
    chapterText,
    chapterUrl,
    [chapterUrlKey]: chapterUrl,
  };

  return chapter;
};

const searchNovels = async (searchTerm) => {
  const url = `${sourceUrl}?s=${searchTerm}&post_type=wp-manga&adult=yes`;

  const result = await fetch(url);
  const body = await result.text();

  const $ = cheerio.load(body);

  const novels = [];

  $(".c-tabs-item__content").each(function (result) {
    const novelName = $(this).find(".h4 > a").text().trim();
    const novelCover = $(this).find("img").attr("src");

    let novelUrl = $(this).find(".h4 > a").attr("href");
    novelUrl = new URL(novelUrl);
    novelUrl = `${novelUrl.origin}${novelUrl.pathname}`;

    const novel = {
      sourceId,
      novelName,
      novelCover,
      novelUrl,
      [novelUrlKey]: novelUrl,
    };

    novels.push(novel);
  });

  return novels;
};

const TuNovelaLigeraScraper = {
  sourceId,
  sourceName,
  sourceUrl,
  sourceLanguage,

  getNovels,
  getNovel,
  getChapter,
  searchNovels,
};

export default TuNovelaLigeraScraper;
