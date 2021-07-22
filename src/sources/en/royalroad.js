import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";
import moment from "moment";
import { parseMadaraDate } from "../helpers/parseDate";

const baseUrl = "https://www.royalroad.com/";

const popularNovels = async (page) => {
    const totalPages = 1846;
    let url = baseUrl + "fictions/best-rated?page=" + page;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.fiction-list-item.row").each(function () {
        const novelName = $(this).find("h2.fiction-title").text().trim();
        let novelCover = $(this).find("img").attr("src");

        if (novelCover === "/Content/Images/nocover-new-min.png") {
            novelCover =
                "https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true";
        }
        let novelUrl = $(this)
            .find("h2.fiction-title > a")
            .attr("href")
            .replace("/fiction/", "");

        const novel = {
            sourceId: 34,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = baseUrl + "fiction/" + novelUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 34;

    novel.sourceName = "Royal Road";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novelName = $("h1").text();
    novel.novelName = novelName;

    novel.novelCover = $("img.thumbnail").attr("src");

    novel.summary = $("div.description").text().trim();

    novel.author = $("h1").next().text().replace("by ", "").trim();
    novel.genre = $("span.tags").text().trim().replace(/\n\s+/g, ",");
    novel.status = $(
        "div.fiction-info > div.portlet > .col-md-8 > .margin-bottom-10 > span"
    )
        .first()
        .next()
        .text()
        .trim();

    let novelChapters = [];

    $("table#chapters > tbody")
        .find("tr")
        .each(function () {
            const chapterName = $(this).find("td").first().text().trim();
            let releaseDate = $(this).find("td").first().next().text().trim();
            releaseDate = releaseDate && parseMadaraDate(releaseDate);

            const chapterUrl = $(this)
                .find("td")
                .first()
                .find("a")
                .attr("href")
                .replace("/fiction/" + novelUrl + "/chapter/", "");

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
    const url = `${baseUrl}fiction/${novelUrl}/chapter/${chapterUrl}`;

    console.log(url);

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("div.chapter-content").find("strong").text();

    let chapterText = $("div.chapter-content").html();
    chapterText = htmlToText(chapterText);

    const chapter = {
        sourceId: 34,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = baseUrl + "fictions/search?title=" + searchTerm;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.fiction-list-item.row").each(function () {
        const novelName = $(this).find("h2.fiction-title").text().trim();
        let novelCover = $(this).find("img").attr("src");

        if (novelCover.includes("Content")) {
            novelCover = baseUrl + novelCover;
        }

        let novelUrl = $(this)
            .find("h2.fiction-title > a")
            .attr("href")
            .replace("/fiction/", "");

        const novel = {
            sourceId: 34,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const RoyalRoadScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default RoyalRoadScraper;
