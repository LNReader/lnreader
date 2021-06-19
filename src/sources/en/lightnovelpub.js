import cheerio from "react-native-cheerio";

import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://www.lightnovelpub.com/";

const popularNovels = async (page) => {
    let url = baseUrl + "browse/all/popular/all/" + page;

    let headers = new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent":
            "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    });

    const result = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".novel-item.ads").remove();

    $(".novel-item").each(function (result) {
        const novelName = $(this)
            .find(".novel-title")
            .text()
            .replace(/[\t\n]/g, "");

        const novelCover = $(this).find("img").attr("data-src");

        let novelUrl = $(this)
            .find(".novel-title > a")
            .attr("href")
            .replace(`/novel/`, "");
        novelUrl += "/";

        const novel = {
            sourceId: 15,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}novel/${novelUrl}/`;

    let headers = new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent":
            "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    });

    const result = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 15;

    novel.sourceName = "LightNovelPub";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("h1.novel-title")
        .text()
        .replace(/[\t\n]/g, "")
        .trim();

    novel.novelCover = $("figure.cover > img").attr("src");

    novel.genre = "";

    $("div.categories > ul > li").each(function (result) {
        novel.genre +=
            $(this)
                .text()
                .replace(/[\t\n]/g, "") + ",";
    });

    $("div.header-stats > span").each(function (result) {
        if ($(this).find("small").text() === "Status") {
            novel.Status = $(this).find("strong").text();
        }
    });

    novel.genre = novel.genre.slice(0, -1);

    novel.author = $(".author > a > span").text();

    novelSummary = $(".summary > .content").html();
    novel.summary = htmlToText(novelSummary).trim();

    let novelChapters = [];

    let firstChapterNo, totalChapters;

    totalChapters = $(".header-stats > span").first().text().match(/\d+/)[0];
    firstChapterNo = $(".chapter-no").first().text().match(/\d+/)[0];

    for (let i = firstChapterNo; i <= totalChapters; i++) {
        const chapterName = "Chapter " + i;

        const releaseDate = null;

        const chapterUrl = "chapter-" + i;

        const chapter = { chapterName, releaseDate, chapterUrl };

        novelChapters.push(chapter);
    }

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}novel/${novelUrl}/${chapterUrl}`;

    let headers = new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent":
            "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    });

    const result = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await result.text();
    $ = cheerio.load(body);

    const chapterName = $("h2").text();
    let chapterText = $("#chapter-container").html();
    chapterText = htmlToText(chapterText);

    let nextChapter = null;

    if (!$("a.nextchap.isDisabled").length) {
        nextChapter = $("a.nextchap")
            .attr("href")
            .replace("/novel/" + novelUrl + "/", "");
    }

    let prevChapter = null;

    if (!$("a.prevchap.isDisabled").length) {
        prevChapter = $("a.prevchap")
            .attr("href")
            .replace("/novel/" + novelUrl + "/", "");
    }

    const chapter = {
        sourceId: 15,
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
    const url = `${baseUrl}lnwsearchlive?inputContent=${searchTerm}`;

    let headers = new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent":
            "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    });

    const result = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    let results = JSON.parse($("body").text());

    $ = cheerio.load(results.resultview);

    $(".novel-item").each(function (result) {
        const novelName = $(this).find("h4.novel-title").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find("a").attr("href").replace(`/novel/`, "");
        novelUrl += "/";

        const novel = {
            sourceId: 15,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const lightNovelPubScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default lightNovelPubScraper;
