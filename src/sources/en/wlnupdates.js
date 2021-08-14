import cheerio from "react-native-cheerio";
import { Status } from "../helpers/constants";
import NovelUpdatesScraper from "./novelupdates";

const sourceId = 62;

const sourceName = "WLNUpdates";

const baseUrl = "https://www.wlnupdates.com/";

let headers = new Headers({
    "User-Agent":
        "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
});

const popularNovels = async (page) => {
    const totalPages = 100;
    let url = `${baseUrl}highest-rated/` + page;

    const result = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await result.text();

    const $ = cheerio.load(body);

    const novels = [];

    $("table").find("tr").first().remove();

    $("tr").each(function (res) {
        const novelCover =
            "https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true";

        const novelName = $(this).find("td > a").text();
        const novelUrl =
            "https://www.wlnupdates.com" + $(this).find("td > a").attr("href");

        const novel = {
            sourceId,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = novelUrl;

    const result = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {
        sourceId,
        sourceName,
        url,
        novelUrl,
    };

    novel.novelName = $("h2").text();

    novel.novelCover =
        "https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true";

    novel.author = $(".multiitem#author")
        .text()
        .trim()
        .replace(/[\t\n]/g, "");

    novel.genre = $(".multiitem#genre")
        .text()
        .trim()
        .replace(/[\t\n]/g, "");

    novel.status = Status.UNKNOWN;

    let summary = $("#description").text().trim();

    novel.summary = summary;

    let novelChapters = [];

    $("#release-entry").each(function () {
        let chapterName;

        if ($(this).find("td.numeric").length > 1) {
            chapterName =
                "Volume " +
                $(this).find(" td:nth-child(3)").text().trim() +
                " Chapter " +
                $(this).find(" td:nth-child(4)").text().trim();
        } else if ($(this).find("td.numeric").length > 0) {
            chapterName = "Chapter " + $(this).find("td.numeric").text().trim();
        } else {
            chapterName = $(this).find("td.postfix").text().trim();
        }

        const releaseDate = $(this).find(".release-entry-cell").text().trim();

        const chapterUrl = $(this).find("td:nth-child(1) > a").attr("href");

        novelChapters.push({ chapterName, releaseDate, chapterUrl });
    });

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const chapterName = "";
    const chapterText = (
        await NovelUpdatesScraper.parseChapter(novelUrl, chapterUrl)
    ).chapterText;

    const chapter = {
        sourceId,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = baseUrl + "search?title=" + searchTerm;

    const res = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await res.text();

    $ = cheerio.load(body);

    let novels = [];

    $("tr").each(function (res) {
        const novelCover =
            "https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true";
        const novelName = $(this).find("td > a").text();
        const novelUrl =
            "https://www.wlnupdates.com" + $(this).find("td > a").attr("href");

        const novel = {
            sourceId,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });
    return novels;
};

const WLNUpdatesScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default WLNUpdatesScraper;
