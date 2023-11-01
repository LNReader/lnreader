const cheerio = require("cheerio");
const { parseRelativeDate } = require("../../utils");

const sourceId = 101;

const sourceName = "TuNovelaLigera";

const baseUrl = "https://tunovelaligera.com/";

const popularNovels = async (page) => {
  let url = baseUrl + "lista-novelas/";

  const totalPages = 1;
  let result = [];

  try {
    let data = await axios.get(url);
    let $ = cheerio.load(data.data);

    $("div.listnovel-item").each(function (resultNumber, element) {
      if (resultNumber < 50) {
        const novelName = $(element).find("h3").text().trim();
        const novelCover = $(element).find("img").attr("src");

        let novelUrl = $(element).find("a").attr("href").split("/")[4] + "/";

        const novel = {
          sourceId,
          novelName,
          novelCover,
          novelUrl,
        };

        result.push(novel);
      }
    });
  } catch (error) {
    console.error(error);
  }

  return { result, totalPages };
};

const parseNovelAndChapters = async (novelUrl) => {
  const url = baseUrl + "novel/" + novelUrl;

  let novel = {};

  try {
    const result = await axios.get(url);
    const $ = cheerio.load(result.data);

    novel.sourceId = sourceId;

    novel.sourceName = sourceName;

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("h1.entry-title").text().trim();

    novel.novelCover =
      $("div.summary_image > a > img").attr("data-lazy-src") ||
      $("div.summary_image > a > img").attr("src");

    novel.summary = $("div.summary__content").text().trim();

    novel.genre =
      $("div.genres-content > a")
        .map(function () {
          return $(this).text().trim();
        })
        .get()
        .join(",") || "";

    novel.author =
      $("div.author-content > a")
        .map(function () {
          return $(this).text().trim();
        })
        .get()
        .join(",") || "";

    novel.status =
      $("div.post-status > div:nth-child(2) > div.summary-content")
        .text()
        .trim() || "Ongoing";

    let novelChapters = [];

    const data = await axios.get(url + "ajax/chapters/");
    $ = cheerio.load(data.data);

    $(".wp-manga-chapter").each(function () {
      const chapterName = $(this).find("a").text().trim();
      const releaseDate = parseRelativeDate(
        $(this).find("span.chapter-release-date i").text().trim()
      );
      const chapterUrl = $(this).find("a").attr("href");

      novelChapters.push({ chapterName, releaseDate, chapterUrl });
    });

    novel.chapters = novelChapters.reverse();
  } catch (error) {
    console.error(error);
  }

  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const url = chapterUrl;

  try {
    const result = await axios.get(url);
    const $ = cheerio.load(result.data);

    let chapterName;
    let chapterText;
    let nextChapter;
    let prevChapter;

    chapterName = $(".breadcrumb li.active").text().trim();

    chapterText =
      $(".reading-content p")
        .map(function () {
          return $(this).html();
        })
        .get()
        .join("<br/>") || "";

    nextChapter =
      $(".nav-next a").attr("href") === undefined
        ? null
        : $(".nav-next a").attr("href");
    
    prevChapter =
      $(".nav-previous a").attr("href") === undefined
        ? null
        : $(".nav-previous a").attr("href");

    return { chapterName, chapterText, nextChapter, prevChapter };
  } catch (error) {
    console.error(error);
  }
};

const searchNovels = async (searchTerm) => {
  const searchUrl =
    baseUrl + "?s=" + searchTerm + "&post_type=wp-manga&author=&artist=&release=";

  let result;
  let novelsList;

  try {
    result = await axios.get(searchUrl);
    
    if (result.status === 200) {
      novelsList =
        result.data.results !== undefined
          ? result.data.results.map((item) => ({
              sourceId,
              novelName: item.title,
              novelCover: item.image,
              novelUrl: item.url.split("/")[4] + "/",
            }))
          : [];
    }
  } catch (error) {
    console.error(error);
  }

  return novelsList;
};

const TuNovelaLigeraScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

module.exports = TuNovelaLigeraScraper;
