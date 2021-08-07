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

    const novelId = novelUrl.split("-")[0];
    const fetchChaptersUrl = `https://ranobehub.org/api/ranobe/${novelId}/contents`;

    const chaptersRaw = await fetch(fetchChaptersUrl);
    const chaptersJSON = await chaptersRaw.json();

    chaptersJSON.volumes.map((volume) =>
        volume.chapters.map((chapter) =>
            novelChapters.push({
                chapterName: chapter.name,
                chapterUrl: chapter.url,
                releaseDate: null,
            })
        )
    );

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = chapterUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $(
        "body > div.pusher.container_main > div:nth-child(5) > div:nth-child(1) > div.title-wrapper > h1"
    ).text();
    let chapterText = $(
        "body > div.pusher.container_main > div:nth-child(5) > div:nth-child(1)"
    ).html();

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
    const url = "https://ranobehub.org/api/fulltext/ranobe?query=" + searchTerm;

    const result = await fetch(url);
    const data = await result.json();

    let novels = [];

    data.data.map((novel) =>
        novels.push({
            sourceId,
            novelName: novel.names.rus,
            novelUrl: novel.url.match(
                /https:\/\/ranobehub\.org\/ranobe\/(.*?)\?utm_source=search_name&utm_medium=search&utm_campaign=search_using/
            )[1],
            novelCover: novel.image,
        })
    );

    return novels;
};

const RanobeHubScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default RanobeHubScraper;
