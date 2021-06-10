import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://freewebnovel.com/";

const popularNovels = async (page) => {
    let url = baseUrl + "completed-novel/" + page;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".li-row").each(function (result) {
        const novelName = $(this).find(".tit").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this)
            .find("h3 > a")
            .attr("href")
            .replace(".html", "")
            .slice(1);

        const novel = {
            sourceId: 13,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}${novelUrl}.html`;

    console.log(url);

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 13;

    novel.sourceName = "FreeWebNovel";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("h1.tit").text();

    novel.novelCover = $(".pic > img").attr("src");

    novel.genre = $("[title=Genre]")
        .next()
        .text()
        .replace(/[\t\n]/g, "");

    novel.author = $("[title=Author]")
        .next()
        .text()
        .replace(/[\t\n]/g, "");

    novel.artist = null;

    novel.status = $("[title=Status]")
        .next()
        .text()
        .replace(/[\t\n]/g, "");

    // novel.Alternative = $("[title='Alternative names']")
    //     .next()
    //     .text()
    //     .replace(/[\t\n]/g, "");

    let novelSummary = $(".inner").text();
    novel.summary = novelSummary;

    let novelChapters = [];

    let latestChapter;

    $("h3.tit").each(function (res) {
        if ($(this).find("a").text() === novel.novelName) {
            // console.log($(this).find("a").text());
            // console.log(novel.novelName);
            latestChapter = $(this).next().find("span.s3").text().match(/\d+/);
        }
    });

    latestChapter = latestChapter[0];

    for (let i = 1; i <= parseInt(latestChapter); i++) {
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
    const url = `${baseUrl}${novelUrl}/${chapterUrl}.html`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("h1.tit").text();

    let chapterText = $("div.txt").html();
    chapterText = htmlToText(chapterText);

    let nextChapter = null;

    if ($("[title='Read Next chapter']").length) {
        nextChapter = $("[title='Read Next chapter']")
            .attr("href")
            .replace("/" + novelUrl + "/", "")
            .replace(".html", "");
    }

    let prevChapter = null;

    if ($("[title='Read Privious Chapter']").length) {
        prevChapter = $("[title='Read Privious Chapter']")
            .attr("href")
            .replace("/" + novelUrl + "/", "")
            .replace(".html", "");
    }

    chapterUrl = chapterUrl;

    const chapter = {
        sourceId: 13,
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
    const url = baseUrl + "search/";

    const formData = new FormData();
    formData.append("searchkey", searchTerm);

    const result = await fetch(url, {
        method: "POST",
        body: formData,
    });
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".li-row > .li > .con").each(function (result) {
        const novelName = $(this).find(".tit").text();
        const novelCover = $(this).find(".pic > a > img").attr("data-cfsrc");

        let novelUrl = $(this)
            .find("h3 > a")
            .attr("href")
            .replace(".html", "")
            .slice(1);

        novelUrl += "/";

        const novel = {
            sourceId: 13,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const FreeWebNovelScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default FreeWebNovelScraper;
