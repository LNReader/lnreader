import cheerio from "react-native-cheerio";
import { Status } from "../helpers/constants";

const sourceId = 69;

const sourceName = "RanobeHub";

const baseUrl = "https://ranobehub.org/";

const popularNovels = async (page) => {
    let url =
        baseUrl + "api/search?page=" + page + "&sort=computed_rating&take=40";
    const totalPages = 69;

    const result = await fetch(url);
    const body = await result.json();

    let novels = [];

    body.resource.forEach((novel) => {
        const novelName = novel.names.rus;
        const novelCover = novel.poster.medium;
        const novelUrl = novel.url.split("/").pop();

        novels.push({
            sourceId,
            novelName,
            novelCover,
            novelUrl,
        });
    });

    return { novels, totalPages };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = baseUrl + "ranobe/" + novelUrl;
    console.log(url);

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = { sourceId, sourceName, url, novelUrl };

    novel.novelName = $("h1").text();

    novel.novelCover = $("img.__posterbox ").attr("data-src");

    novel.summary = $(".book-description__text").text().trim();

    novel.genre = "";

    novel.status = Status.UNKNOWN;

    novel.author = $(".book-author").text().trim();

    let novelChapters = [];

    $("div.contents-chapter").each(function () {
        console.log("Called");
    });

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}mtl/${novelUrl}/${chapterUrl}`;

    console.log(url);

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = "";

    let chapterText = $(".txtnav").html();
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
    const url = baseUrl + "?s=" + searchTerm + "&post_type=novel";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".newbox")
        .find("li")
        .each(function () {
            const novelName = $(this).find("h3").text();
            const novelCover = $(this).find("img").attr("src");

            let novelUrl = $(this).find("a").attr("href");
            novelUrl = novelUrl.replace(baseUrl + "novel/", "");

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

const RanobeHubScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default RanobeHubScraper;
