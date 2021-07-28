import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://hasutl.wordpress.com/";

const popularNovels = async (page) => {
    let totalPages = 1;
    let url = baseUrl + "light-novels-activas/";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.wp-block-columns").each(function (result) {
        const novelName = $(this).find(".wp-block-button").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find(".wp-block-button > a").attr("href");
        novelUrl = novelUrl.replace(baseUrl, "");

        const novel = {
            sourceId: 29,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}/${novelUrl}/`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 29;

    novel.sourceName = "Hasu Translations";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $(".post-header").text();

    novel.novelCover = $(".featured-media > img").attr("src");

    let details = $(".post-content").find("p").html();

    detailName = details.match(/<strong>(.|\n)*?<\/strong>/g);
    details = details.match(/<\/strong>(.|\n)*?<br>/g);
    details = details.map((detail) => detail.replace(/<\/strong>|<br>/g, ""));

    novel.genre = "";

    detailName.map((detail, index) => {
        if (detail.includes("Autor")) {
            novel.author = details[index];
        }
        if (detail.includes("Géneros")) {
            novel.genre = details[index].replace(/\s/g, "");
        }
        if (detail.includes("Artista")) {
            novel.artist = details[index];
        }
    });

    let novelSummary = $(".post-content").find("p").html();
    novel.summary = htmlToText(novelSummary);

    let novelChapters = [];

    $(".wp-block-media-text__content")
        .find("a")
        .each(function (result) {
            const chapterName = $(this).text().trim();

            const releaseDate = null;

            let chapterUrl = $(this).attr("href").split("/");
            chapterUrl = chapterUrl[chapterUrl.length - 2];

            const chapter = { chapterName, releaseDate, chapterUrl };

            novelChapters.push(chapter);
        });

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}/${novelUrl}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $(".post-title").text();

    let chapterText = $(".post-content").html();
    chapterTextRaw = chapterText;
    chapterText = htmlToText(chapterText);

    novelUrl = novelUrl + "/";
    chapterUrl = chapterUrl;

    const chapter = {
        sourceId: 29,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
        chapterTextRaw,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".post-container ").each(function (result) {
        const novelName = $(this).find(".post-header").text();
        if (
            !novelName.includes("Cap") &&
            !novelName.includes("Vol") &&
            !novelName.includes("Light Novels")
        ) {
            const novelCover = $(this).find("img").attr("src");

            let novelUrl = $(this).find("a").attr("href");
            novelUrl = novelUrl.replace(baseUrl, "");

            const novel = {
                sourceId: 29,
                novelName,
                novelCover,
                novelUrl,
            };

            novels.push(novel);
        }
    });

    return novels;
};
const HasuTlScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default HasuTlScraper;
