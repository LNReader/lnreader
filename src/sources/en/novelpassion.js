import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";
import moment from "moment";

const baseUrl = "https://www.novelpassion.com/";

const popularNovels = async (page) => {
    const totalPages = 42;
    let url = baseUrl + "category/all?p=" + page + "&s=1&f=4";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.j_bookList.lis-mn.ddc")
        .find("li")
        .each(function (result) {
            const novelName = $(this).find("h3").text();
            const novelCover =
                "https://www.novelpassion.com" +
                $(this).find("img").attr("src");

            let novelUrl = $(this).find("div.pr > a").attr("href");
            novelUrl = novelUrl.replace("/novel/", "");

            const novel = {
                sourceId: 33,
                novelName,
                novelCover,
                novelUrl,
            };

            novels.push(novel);
        });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = baseUrl + "novel/" + novelUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 33;

    novel.sourceName = "NovelPassion";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novelName = $("h2.mh").text();
    novel.novelName = novelName;

    novel.novelCover = baseUrl + $("i.g_thumb > img").attr("src");

    let novelSummary = $("div.j_synopsis").text().trim();
    novel.summary = novelSummary;

    $("address.lh20.m14.pr").each(function (result) {
        detailName = $(this).find("p.ell.dib.vam").text().trim();

        detail = $(this).find("div.dns").text().trim();

        switch (detailName) {
            case "Categories:":
                novel.genre = detail.trim().replace(/ -  /g, ",");
                break;
            case "Author:":
                novel.author = detail.trim().replace(/ -  /g, ", ");
                break;
        }

        if (detailName.includes("Status:")) {
            novel.status = detailName.replace("Status:", "").trim();
        }
    });

    let novelChapters = [];

    $(".content-list")
        .find("li")
        .each(function (result) {
            const chapterName = $(this).find("span.sp1").text();

            let releaseDate = $(this).find("i.sp2").text();
            releaseDate = moment(new Date(releaseDate)).format("MM/DD/YY");

            const chapterUrl = $(this)
                .find("a")
                .attr("href")
                .replace("/novel/" + novelUrl + "/", "");

            novelChapters.push({
                chapterName,
                releaseDate,
                chapterUrl,
            });
        });

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}novel/${novelUrl}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("div.cha-content").find("strong").text();

    let chapterText = $("div.cha-content").html();
    chapterTextRaw = chapterText;
    chapterText = htmlToText(chapterText);

    const chapter = {
        sourceId: 33,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
        chapterTextRaw,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = baseUrl + "search?keyword=" + searchTerm;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.j_bookList.lis-mn.ddc")
        .find("li")
        .each(function (result) {
            const novelName = $(this).find("h3").text();
            const novelCover =
                "https://www.novelpassion.com" +
                $(this).find("img").attr("src");

            let novelUrl = $(this).find("div.pr > a").attr("href");
            novelUrl = novelUrl.replace("/novel/", "");

            const novel = {
                sourceId: 33,
                novelName,
                novelCover,
                novelUrl,
            };

            novels.push(novel);
        });

    return novels;
};

const NovelPassionScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default NovelPassionScraper;
