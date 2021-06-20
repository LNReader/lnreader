import cheerio from "react-native-cheerio";

import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://www.novelhall.com/";

const popularNovels = async (page) => {
    let totalPages = 1;
    const result = await fetch(baseUrl);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.section1")
        .find("li")
        .each(function (result) {
            const novelName = $(this).find(".book-info > h2 > a").text();
            const novelCover = $(this).find("img").attr("src");
            const novelUrl = $(this).find("a").attr("href").substring(1);

            const novel = {
                sourceId: 6,
                novelName,
                novelCover,
                novelUrl,
            };

            novels.push(novel);
        });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}${novelUrl}/`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 6;

    novel.sourceName = "NovelHall";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("h1").text();

    novel.novelCover = $("div.book-img > img").attr("src");

    novel.summary = $("div.intro")
        .text()
        .replace(/[\t\n]/g, "");

    novel.author = $("span.blue").first().text().replace("Author：", "");

    novel.genre = $("a.red").text();

    novel.artist = null;

    novel.Status = $("span.blue").first().next().text().replace("Status：", "");

    let novelChapters = [];

    $("div.book-catalog.hidden-xs#morelist")
        .find("li.post-11")
        .each(function (result) {
            let chapterName = $(this).find("a").text();

            let releaseDate = null;

            let chapterUrl = $(this).find("a").attr("href");

            if (chapterUrl) {
                chapterUrl = chapterUrl.replace(`/${novelUrl}/`, "");
            }

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
    const url = `${baseUrl}${novelUrl}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    const chapterName = $("h1").text();
    let chapterText = $("div.entry-content").html();
    chapterText = htmlToText(chapterText);

    let nextChapter = null;
    nextChapter = $('a[rel="next"]').attr("href");
    if (nextChapter) {
        nextChapter = nextChapter.replace(`/${novelUrl}/`, "");
    }

    let prevChapter = null;
    prevChapter = $('a[rel="prev"]').attr("href");
    if (prevChapter) {
        prevChapter = prevChapter.replace(`/${novelUrl}/`, "");
    }

    chapter = {
        sourceId: 6,
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
    const searchUrl = `${baseUrl}index.php?s=so&module=book&keyword=`;

    const url = `${searchUrl}${searchTerm}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("tr").each(function (result) {
        let novelName = $(this).find("td:nth-child(2)").text();
        novelName = novelName.replace(/[\t\n]/g, "");

        const novelCover = "https://cdn.novelupdates.com/imgmid/noimagemid.jpg";

        let novelUrl = $(this).find("td:nth-child(2) >").attr("href");
        if (novelUrl) {
            novelUrl = novelUrl.slice(1);
        }

        novel = {
            sourceId: 6,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const novelhallScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default novelhallScraper;
