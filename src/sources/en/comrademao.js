import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const sourceId = 27;

const sourceName = "Comrade Mao";

const baseUrl = "https://comrademao.com/";

const popularNovels = async (page) => {
    let url = baseUrl + "novel/page/" + page;
    const totalPages = 108;
    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("article.blog-article").each(function (result) {
        const novelName = $(this).find("h5 > a").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find("h5 > a").attr("href");
        novelUrl = novelUrl.replace(baseUrl + "novel/", "");

        const novel = {
            sourceId,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { novels, totalPages };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = baseUrl + "novel/" + novelUrl;
    console.log(url);

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 27;

    novel.sourceName = sourceName;

    novel.url = url;

    novel.novelUrl = novelUrl;

    function getNovelName(y) {
        return y
            .split("-")
            .map((part) => {
                return part.charAt(0).toUpperCase() + part.slice(1);
            })
            .join(" ")
            .replace("/", "");
    }

    novelName = getNovelName(novelUrl);
    console.log(novelName);
    novel.novelName = novelName;

    novel.novelCover = $("#thumbnail > img").attr("src");

    novel.summary = $("div#Description")
        .text()
        .replace("Description", "")
        .trim();

    novel.genre = $("div#Genre")
        .text()
        .replace(/Genre:|\s/g, "");

    novel.status = $("div#Status")
        .text()
        .replace(/Status:|\s/g, "");

    novel.author = $("div#Publisher")
        .text()
        .replace(/Publisher:|\s/g, "");

    let novelChapters = [];

    let chapterUrlPrefix = $("tbody > tr")
        .first()
        .next()
        .find("td > a")
        .text()
        .split(" ");

    chapterUrlPrefix.pop();

    chapterUrlPrefix = chapterUrlPrefix.join("-").toLowerCase();

    const latestChapter = $("tbody > tr")
        .first()
        .next()
        .find("td > a")
        .text()
        .replace(/^\D+/g, "");

    for (let i = 1; i <= latestChapter; i++) {
        const chapterName = "Chapter " + i;
        const releaseDate = null;
        const chapterUrl = chapterUrlPrefix + "-" + i + "/";

        const chapter = {
            chapterName,
            releaseDate,
            chapterUrl,
        };

        novelChapters.push(chapter);
    }
    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}mtl/${novelUrl}/${chapterUrl}`;

    console.log(url);

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $(".entry-title").text();

    let chapterText = $(".entry-content").html();
    chapterText = htmlToText(chapterText);

    let nextChapter = null;

    if ($(".nav-next").find("a").length) {
        nextChapter = $(".nav-next")
            .find("a")
            .attr("href")
            .replace(baseUrl + "mtl/" + novelUrl + "/", "");
    }

    let prevChapter = null;

    if ($(".nav-previous").find("a").length) {
        prevChapter = $(".nav-previous")
            .find("a")
            .attr("href")
            .replace(baseUrl + "mtl/" + novelUrl + "/", "");
    }

    novelUrl = novelUrl + "/";
    chapterUrl = chapterUrl + "/";

    const chapter = {
        sourceId,
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
    const url = baseUrl + "?s=" + searchTerm + "&post_type=novel";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("article.blog-article").each(function (result) {
        const novelName = $(this).find("h5 > a").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find("h5 > a").attr("href");
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

const ComradeMaoScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default ComradeMaoScraper;
