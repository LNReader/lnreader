import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://einherjarproject.net/";

const popularNovels = async (page) => {
    let totalPages = 1;
    let url = baseUrl + "proyectos-activos/";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".wp-block-media-text").each(function (result) {
        const novelName = $(this).find("a").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this)
            .find(".wp-block-media-text__content")
            .find("a")
            .attr("href");
        novelUrl = novelUrl.replace(baseUrl, "");

        const novel = {
            sourceId: 25,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = baseUrl + novelUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 25;

    novel.sourceName = "Einherjar Project";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("h1").text();

    novel.novelCover = $("img").attr("src");

    $(".wp-block-columns")
        .find("li")
        .each(function (result) {
            if ($(this).text().includes("Autor:")) {
                novel.author = $(this)
                    .text()
                    .replace("Autor:", "")
                    .slice(0, -1);
            }
            if ($(this).text().includes("Ilustrador: ")) {
                novel.artist = $(this)
                    .text()
                    .replace("Ilustrador: ", "")
                    .slice(0, -1);
            }
            if ($(this).text().includes("Estado: ")) {
                novel.status = $(this)
                    .text()
                    .replace("Estado: ", "")
                    .slice(0, -1);
            }
        });

    novel.genre = $(".post-content > h6")
        .text()
        .replace(/GÉNEROS: /, "")
        .replace(/,\s/g, ",");

    let novelSummary = $(".post-content > .has-text-align-center").html();

    novel.summary = novelSummary.trim();

    let novelChapters = [];

    $(".wp-block-media-text")
        .find("p")
        .each(function (result) {
            if ($(this).find("a").text()) {
                const chapterName = $(this).text();
                const releaseDate = null;
                let chapterUrl = $(this)
                    .find("a")
                    .attr("href")
                    .replace(baseUrl, "");
                if (chapterUrl.includes(novelUrl + "/"))
                    chapterUrl = chapterUrl.replace(novelUrl + "/", "");

                const chapter = { chapterName, releaseDate, chapterUrl };

                novelChapters.push(chapter);
            }
        });

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = baseUrl + chapterUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("h1.post-title").text();

    let chapterText = $(".post-content").html();
    chapterText = htmlToText(chapterText);

    let nextChapter = null;
    let prevChapter = null;

    novelUrl = novelUrl + "/";
    chapterUrl = chapterUrl + "/";

    const chapter = {
        sourceId: 25,
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
    const url = baseUrl + "?s=" + searchTerm;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".post-container")
        .find("div.type-page")
        .each(function (result) {
            const novelName = $(this)
                .find(".post-header")
                .text()
                .replace(/\n/g, "");
            if (
                !novelName.includes("EPUBs") &&
                !novelName.includes("Proyectos Activos") &&
                !novelName.includes("Chapter")
            ) {
                const novelCover = $(this).find("img").attr("src");

                let novelUrl = $(this)
                    .find("a")
                    .attr("href")
                    .replace(baseUrl, "");

                const novel = {
                    sourceId: 25,
                    novelName,
                    novelCover,
                    novelUrl,
                };

                novels.push(novel);
            }
        });

    return novels;
};

const EinharjarProjectScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default EinharjarProjectScraper;
