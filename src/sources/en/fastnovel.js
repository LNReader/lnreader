import cheerio from "react-native-cheerio";

const baseUrl = "https://fastnovel.net";
const searchUrl = `https://fastnovel.net/search/`;

const popularNovels = async (page) => {
    let totalPages = 39;
    const url = `${baseUrl}/list/most-popular.html?page=${page}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".film-item").each(function (result) {
        const novelName = $(this).find(".name").text();
        const novelCover = $(this).find(".img").attr("data-original");
        const novelUrl = $(this).find("a").attr("href").substring(1);

        const novel = {
            sourceId: 3,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}/${novelUrl}/`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 3;

    novel.sourceName = "FastNovel";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("h1").text();

    novel.novelCover = $(".book-cover").attr("data-original");

    novel.summary = $("div.film-content > p").text();

    novel.author = $("li > label")
        .filter(function () {
            return $(this).text().trim() === "Author:";
        })
        .next()
        .text();

    novel.genre = $("li")
        .filter(function () {
            return $(this).find("label").text().trim() === "Genre:";
        })
        .text()
        .replace("Genre:", "");

    novel.artist = null;

    novel.status = null;

    novel.status = $("li")
        .filter(function () {
            return $(this).find("label").text().trim() === "Status:";
        })
        .text()
        .includes("Completed")
        ? "Completed"
        : "Ongoing";

    let novelChapters = [];

    $(".chapter").each(function (result) {
        const chapterName = $(this).text();
        const releaseDate = null;
        let chapterUrl = $(this).attr("href");
        chapterUrl = chapterUrl.replace(`/${novelUrl}/`, "");

        const novel = {
            chapterName,
            releaseDate,
            chapterUrl,
        };

        novelChapters.push(novel);
    });

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}/${novelUrl}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    const chapterName = $(".episode-name").text();

    let chapterText = $("#chapter-body").html();
    const chapter = {
        sourceId: 3,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = `${searchUrl}${searchTerm}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".film-item").each(function (result) {
        const novelName = $(this).find("div.title > p.name").text();
        const novelCover = $(this).find(".img").attr("data-original");
        const novelUrl = $(this).find("a").attr("href").substring(1);

        const novel = {
            sourceId: 3,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const fastNovelScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default fastNovelScraper;
