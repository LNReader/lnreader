import cheerio from "react-native-cheerio";

import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://readnovelfull.com";

const popularNovels = async (page) => {
    const url = `${baseUrl}/most-popular-novel?page=${page}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.col-novel-main > div.list-novel > .row").each(function (result) {
        let novelUrl = $(this)
            .find("h3.novel-title > a")
            .attr("href")
            .replace(".html", "")
            .substring(1);
        novelUrl = `${novelUrl}/`;

        const novelName = $(this).find("h3.novel-title > a").text();
        const novelCover = $(this).find("img").attr("src");

        const novel = {
            sourceId: 4,
            novelUrl,
            novelName,
            novelCover,
        };

        novels.push(novel);
    });

    return novels;
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}/${novelUrl.slice(0, -1)}.html`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 4;

    novel.sourceName = "ReadNovelFull";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("div.book > img").attr("alt");

    novel.novelCover = $("div.book > img").attr("src");

    novel.summary = $("div.desc-text").text();

    novel.author = $("li > h3")
        .filter(function () {
            return $(this).text().trim() === "Author:";
        })
        .siblings()
        .text();

    novel.genre = $("li")
        .filter(function () {
            return $(this).find("h3").text().trim() === "Genre:";
        })
        .text()
        .replace("Genre:", "");

    novel.artist = null;

    novel.Status = $("li > h3")
        .filter(function () {
            return $(this).text().trim() === "Status:";
        })
        .siblings()
        .text();

    const novelId = $("#rating").attr("data-novel-id");

    const getChapters = async (novelId) => {
        const chapterListUrl =
            "https://readnovelfull.com/ajax/chapter-archive?novelId=" + novelId;

        const data = await fetch(chapterListUrl);
        const chapters = await data.text();

        $ = cheerio.load(chapters);

        let novelChapters = [];

        $(".panel-body")
            .find("li")
            .each(function (result) {
                let chapterName = $(this).find("a").attr("title");
                let releaseDate = null;
                let chapterUrl = $(this).find("a").attr("href");
                chapterUrl = chapterUrl.replace(`/${novelUrl}/`, "");

                novelChapters.push({
                    chapterName,
                    releaseDate,
                    chapterUrl,
                });
            });
        return novelChapters;
    };

    novel.chapters = await getChapters(novelId);

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    const chapterName = $(".chr-title").attr("title");
    let chapterText = $("#chr-content").html();
    chapterText = htmlToText(chapterText);

    let nextChapter = null;
    if ($("a#next_chap").attr("href")) {
        nextChapter = $("a#next_chap")
            .attr("href")
            .replace(`/${novelUrl}/`, "");
    }

    let prevChapter = null;
    if ($("a#prev_chap").attr("href")) {
        prevChapter = $("a#prev_chap")
            .attr("href")
            .replace(`/${novelUrl}/`, "");
    }

    const chapter = {
        sourceId: 4,
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
    const searchUrl = `https://readnovelfull.com/search?keyword=`;

    const url = `${searchUrl}${searchTerm}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.col-novel-main > div.list-novel > .row").each(function (result) {
        let novelUrl = $(this)
            .find("h3.novel-title > a")
            .attr("href")
            .replace(".html", "")
            .substring(1);
        novelUrl = `${novelUrl}/`;

        const novelName = $(this).find("h3.novel-title > a").text();
        const novelCover = $(this).find("img").attr("src");

        const novel = {
            sourceId: 4,
            novelUrl,
            novelName,
            novelCover,
        };

        novels.push(novel);
    });

    return novels;
};

const readNovelFullScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default readNovelFullScraper;
