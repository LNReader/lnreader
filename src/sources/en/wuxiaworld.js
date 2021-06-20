import cheerio from "react-native-cheerio";

import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://www.wuxiaworld.com/";

const popularNovels = async (page) => {
    let totalPages = 1;
    const url = `${baseUrl}api/novels`;

    const result = await fetch(url);
    const data = await result.json();

    let novels = [];

    data.items.map((novel) => {
        let novelName = novel.name;
        let novelCover = novel.coverUrl;
        let novelUrl = novel.slug;

        novels.push({
            sourceId: 7,
            novelUrl,
            novelName,
            novelCover,
        });
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}novel/${novelUrl}/`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 7;

    novel.sourceName = "WuxiaWorld";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("h2").text();

    novel.novelCover = $("img.img-thumbnail").attr("src");

    novel.summary = $(".fr-view > p").text();

    novel.author = $("div > dt")
        .filter(function () {
            return $(this).text().trim() === "Author:";
        })
        .next()
        .text();

    let genres = [];

    $(".genres")
        .find("div")
        .each(function (res) {
            genres.push($(this).find("a").text());
        });

    novel.genre = genres.join(",");

    novel.artist = null;

    novel.Status = null;

    let novelChapters = [];

    $(".chapter-item").each(function (result) {
        let chapterName = $(this).text();
        chapterName = chapterName.replace(/[\t\n]/g, "");

        const releaseDate = null;

        let chapterUrl = $(this).find("a").attr("href");
        chapterUrl = chapterUrl.replace(`/novel/${novelUrl}/`, "");

        const chapter = {
            chapterName,
            releaseDate,
            chapterUrl,
        };

        novelChapters.push(chapter);
    });

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    let url = `${baseUrl}novel/${novelUrl}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("#sidebar-toggler-container").next().text();
    chapterName = chapterName.replace(/[\t\n]/g, "");

    $("#chapter-content > script").remove();

    let chapterText = $("#chapter-content").html();
    chapterText = htmlToText(chapterText);

    let nextChapter = null;

    if ($("li.next > a").attr("href") !== "#") {
        nextChapter = $("li.next > a")
            .attr("href")
            .replace(`/novel/${novelUrl}`, "");
    }

    let prevChapter = null;

    if ($("li.prev > a").attr("href") !== "#") {
        prevChapter = $("li.prev > a")
            .attr("href")
            .replace(`/novel/${novelUrl}`, "");
    }

    const chapter = {
        sourceId: 7,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
        nextChapter,
        prevChapter,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const searchUrl = `https://www.wuxiaworld.com/api/novels/search?query=`;

    const url = `${searchUrl}${searchTerm}`;

    const result = await fetch(url);
    const data = await result.json();

    let novels = [];

    data.items.map((novel) => {
        let novelName = novel.name;
        let novelCover = novel.coverUrl;
        let novelUrl = novel.slug;

        novels.push({
            sourceId: 7,
            novelUrl,
            novelName,
            novelCover,
        });
    });

    return novels;
};

const WuxiaWorldScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default WuxiaWorldScraper;
