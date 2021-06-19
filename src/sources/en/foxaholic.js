import cheerio from "react-native-cheerio";

import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://foxaholic.com/";

const popularNovels = async (page) => {
    let url = baseUrl + "novel/page/" + page + "/?m_orderby=rating";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".page-item-detail").each(function (result) {
        const novelName = $(this).find(".h5 > a").text();
        const novelCover = $(this).find("img").attr("data-src");

        let novelUrl = $(this).find(".h5 > a").attr("href").split("/")[4];
        novelUrl += "/";

        const novel = {
            sourceId: 22,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}novel/${novelUrl}`;

    console.log(url);

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 22;

    novel.sourceName = "Foxaholic";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $(".post-title > h1")
        .text()
        .replace(/[\t\n]/g, "")
        .trim();

    novel.novelCover = $(".summary_image > a > img").attr("data-src");

    $(".post-content_item").each(function (result) {
        detailName = $(this)
            .find(".summary-heading > h5")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();
        detail = $(this)
            .find(".summary-content")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();

        switch (detailName) {
            case "Genre":
                novel.genre = detail.trim().replace(/[\t\n]/g, ",");
                break;
            case "Author":
                novel.author = detail.trim();
                break;
            case "Artist":
                novel.status = detail.trim();
                break;
        }
    });

    $(".description-summary > div.summary__content").find("em").remove();

    novel.summary = $(".description-summary > div.summary__content")
        .text()
        .trim();

    let novelChapters = [];

    const novelId = $("#manga-chapters-holder").attr("data-id");

    console.log(novelId);

    let formData = new FormData();
    formData.append("action", "manga_get_chapters");
    formData.append("manga", novelId);

    const data = await fetch(
        "https://www.foxaholic.com/wp-admin/admin-ajax.php",
        {
            method: "POST",
            body: formData,
        }
    );
    const text = await data.text();
    console.log(text);

    $ = cheerio.load(text);

    $(".wp-manga-chapter").each(function (result) {
        chapterName = $(this)
            .find("a")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();

        releaseDate = $(this).find("span").text().trim();

        chapterUrl = $(this).find("a").attr("href").split("/");

        chapterUrl[6]
            ? (chapterUrl = chapterUrl[5] + "/" + chapterUrl[6])
            : (chapterUrl = chapterUrl[5]);

        novelChapters.push({ chapterName, releaseDate, chapterUrl });
    });

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}novel/${novelUrl}${chapterUrl}/`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    const chapterName = $("h1#chapter-heading").text();
    let chapterText = $(".reading-content").html();
    chapterText = htmlToText(chapterText);

    let nextChapter = null;

    if ($(".nav-next").length) {
        nextChapter = $(".nav-next").find("a").attr("href").split("/");
        nextChapter[6]
            ? (nextChapter = nextChapter[5] + "/" + nextChapter[6])
            : (nextChapter = nextChapter[5]);
    }

    let prevChapter = null;

    if ($(".nav-previous").length) {
        prevChapter = $(".nav-previous").find("a").attr("href").split("/");
        prevChapter[6]
            ? (prevChapter = prevChapter[5] + "/" + prevChapter[6])
            : (prevChapter = prevChapter[5]);
    }

    const chapter = {
        sourceId: 22,
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
    const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".c-tabs-item__content").each(function (result) {
        const novelName = $(this).find(".h4 > a").text();
        const novelCover = $(this).find("img").attr("data-src");

        let novelUrl = $(this).find(".h4 > a").attr("href").split("/")[4];
        novelUrl += "/";
        const novel = {
            sourceId: 22,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const FoxaHolicScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default FoxaHolicScraper;
