import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://yuukitls.com/";

const popularNovels = async (page) => {
    let totalPages = 1;
    let url = baseUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".menu-item-2869")
        .find(".menu-item.menu-item-type-post_type.menu-item-object-post")
        .each(function (result) {
            const novelName = $(this).text();
            const novelCover = $(this).find("img").attr("src");

            let novelUrl = $(this).find("a").attr("href");
            novelUrl = novelUrl.split("/");
            novelUrl = novelUrl[novelUrl.length - 2] + "/";

            const novel = {
                sourceId: 28,
                novelName,
                novelCover,
                novelUrl,
            };

            novels.push(novel);
        });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}${novelUrl}/`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 28;

    novel.sourceName = "YuukiTls";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("h1.entry-title")
        .text()
        .replace(/[\t\n]/g, "")
        .trim();

    novel.novelCover = $('img[loading="lazy"]').attr("src");

    $(".entry-content")
        .find("div")
        .each(function (result) {
            if ($(this).text().includes("Escritor:")) {
                novel.author = $(this).text().replace("Escritor: ", "").trim();
            }
            if ($(this).text().includes("Ilustrador:")) {
                novel.artist = $(this)
                    .text()
                    .replace("Ilustrador: ", "")
                    .trim();
            }

            if ($(this).text().includes("Género:")) {
                novel.genre = $(this)
                    .text()
                    .replace(/Género: |\s/g, "");
            }

            if ($(this).text().includes("Sinopsis:")) {
                novel.summary = $(this).next().text();
            }
        });

    let novelChapters = [];

    if ($(".entry-content").find("li").length) {
        $(".entry-content")
            .find("li")
            .each(function (result) {
                let chapterUrl = $(this).find("a").attr("href");

                if (chapterUrl && chapterUrl.includes(baseUrl)) {
                    const chapterName = $(this).text();
                    const releaseDate = null;

                    chapterUrl = chapterUrl.split("/");
                    chapterUrl = chapterUrl[chapterUrl.length - 2] + "/";

                    const chapter = { chapterName, releaseDate, chapterUrl };

                    novelChapters.push(chapter);
                }
            });
    } else {
        $(".entry-content")
            .find("p")
            .each(function (result) {
                let chapterUrl = $(this).find("a").attr("href");

                if (chapterUrl && chapterUrl.includes(baseUrl)) {
                    const chapterName = $(this).text();
                    const releaseDate = null;

                    chapterUrl = chapterUrl.split("/");
                    chapterUrl = chapterUrl[chapterUrl.length - 2] + "/";

                    const chapter = { chapterName, releaseDate, chapterUrl };

                    novelChapters.push(chapter);
                }
            });
    }

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}/${novelUrl}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("h3").text();

    let chapterText = $(".entry-content").html();
    chapterText = htmlToText(chapterText);

    novelUrl = novelUrl + "/";
    chapterUrl = chapterUrl + "/";

    const chapter = {
        sourceId: 28,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    searchTerm = searchTerm.toLowerCase();

    let url = baseUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".menu-item-2869")
        .find(".menu-item.menu-item-type-post_type.menu-item-object-post")
        .each(function (result) {
            const novelName = $(this).text();
            const novelCover = $(this).find("img").attr("src");

            let novelUrl = $(this).find("a").attr("href");
            novelUrl = novelUrl.split("/");
            novelUrl = novelUrl[novelUrl.length - 2] + "/";

            const novel = {
                sourceId: 28,
                novelName,
                novelCover,
                novelUrl,
            };

            novels.push(novel);
        });

    novels = novels.filter((novel) =>
        novel.novelName.toLowerCase().includes(searchTerm)
    );

    return novels;
};

const YuukiTlsScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default YuukiTlsScraper;
