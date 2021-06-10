import cheerio from "react-native-cheerio";

import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://www.novelupdates.cc/";

const popularNovels = async (page) => {
    const result = await fetch(baseUrl);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".section-item").each(function (result) {
        const novelName = $(this).find(".book-name").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find("a").attr("href").slice(1);

        const novel = {
            sourceId: 18,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}${novelUrl}/`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 18;

    novel.sourceName = "NovelUpdates.cc";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $(".book-name").text();

    novel.novelCover = $("div.book-img > img").attr("src");

    novel.genre = $("div.book-catalog > span.txt").text();

    novel.Status = $("div.book-state > span.txt").text();

    novel.author = $("div.author > span.name").text();

    novelSummary = $("div.content > p.desc").html();
    novel.summary = htmlToText(novelSummary);

    let novelChapters = [];

    $(".chapter-item").each(function (result) {
        const chapterName = $(this).find(".chapter-name").text();
        const releaseDate = null;
        const chapterUrl = $(this).attr("href").slice(1);

        novelChapters.push({
            chapterName,
            releaseDate,
            chapterUrl,
        });
    });

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    const chapterName = $("h1.chapter-title").text();
    let chapterText = $("div.chapter-entity").html();
    chapterText = htmlToText(chapterText);

    let nextChapter = null;

    if ($("a.next").length) {
        nextChapter = $("a.next").attr("href").slice(1);
    }

    let prevChapter = null;

    if ($("a.prev").length) {
        prevChapter = $("a.prev").attr("href").slice(1);
    }

    const chapter = {
        sourceId: 18,
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
    const url = `${baseUrl}search/${searchTerm}/1`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".list-item").each(function (result) {
        $(this).find("font").remove();

        const novelName = $(this).find(".book-name").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find("a").attr("href").slice(1);

        const novel = {
            sourceId: 18,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const novelUpdatesCcScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default novelUpdatesCcScraper;
