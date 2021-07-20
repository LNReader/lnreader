import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "http://www.novelawuxia.com/";

function getNovelName(y) {
    return y.replace(/-/g, " ").replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

const popularNovels = async (page) => {
    let totalPages = 1;
    let url = baseUrl + "p/todas-las-novelas.html";

    let headers = new Headers({
        "User-Agent":
            "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    });

    const result = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".post-body.entry-content")
        .find("a")
        .each(function (result) {
            let novelName = $(this)
                .attr("href")
                .split("/")
                .pop()
                .replace(".html", "");
            novelName = getNovelName(novelName);
            const novelCover = $(this).find("img").attr("src");

            let novelUrl = $(this).attr("href");
            novelUrl = novelUrl.replace(`${baseUrl}p/`, "") + "/";

            const novel = {
                sourceId: 31,
                novelName,
                novelCover,
                novelUrl,
            };

            novels.push(novel);
        });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}p/${novelUrl.replace("/", "")}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 31;

    novel.sourceName = "Novela Wuxia";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("h1.post-title").text().trim();

    novel.novelCover = $("div.separator").find("a").attr("href");

    novel.artist = "";
    novel.status = "";

    $("div > b").each(function (result) {
        const detailName = $(this).text();
        let detail = $(this)[0].nextSibling;

        if (detailName && detail) {
            detail = detail.nodeValue;

            if (detailName.includes("Autor")) {
                novel.author = detail.replace("Autor:", "");
            }

            if (detailName.includes("Estatus")) {
                novel.status = detail.replace("Estatus: ", "");
            }
            if (detailName.includes("Géneros:")) {
                novel.genre = detail
                    .replace("Géneros: ", "")
                    .replace(/,\s/g, ",");
            }
        }
    });

    let novelChapters = [];

    $("div").each(function (result) {
        const detailName = $(this).text();
        if (detailName.includes("Sinopsis")) {
            novel.summary =
                $(this).next().text() !== ""
                    ? $(this).next().text().replace("Sinopsis", "").trim()
                    : $(this)
                          .next()
                          .next()
                          .text()
                          .replace("Sinopsis", "")
                          .trim();
        }

        if (detailName.includes("Lista de Capítulos")) {
            $(this)
                .find("a")
                .each(function (res) {
                    const chapterName = $(this).text();
                    let chapterUrl = $(this).attr("href");
                    const releaseDate = null;

                    if (
                        chapterName &&
                        chapterUrl &&
                        chapterUrl.includes(novelUrl.replace(".html", "")) &&
                        !novelChapters.some(
                            (chap) => chap.chapterName === chapterName
                        )
                    ) {
                        chapterUrl = chapterUrl.replace(baseUrl, "");

                        const chapter = {
                            chapterName,
                            releaseDate,
                            chapterUrl,
                        };

                        novelChapters.push(chapter);
                    }
                });
        }
    });

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}${year}/${month}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("h1.post-title").text().trim();

    let chapterText = $(".post-body.entry-content").html();
    chapterText = htmlToText(chapterText);

    novelUrl = novelUrl + "/";
    chapterUrl = chapterUrl + "/";

    const chapter = {
        sourceId: 31,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = `${baseUrl}search?q=${searchTerm}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".date-outer").each(function (result) {
        let novelName = $(this)
            .find("a")
            .attr("href")
            .split("/")
            .pop()
            .replace(/-capitulo(.*?).html/, "");

        const novelUrl = novelName + ".html/";

        novelName = getNovelName(novelName);

        const exists = novels.some((novel) => novel.novelName === novelName);

        if (!exists) {
            const novelCover = null;
            const novel = {
                sourceId: 31,
                novelName,
                novelCover,
                novelUrl,
            };

            novels.push(novel);
        }
    });

    return novels;
};

const NovelaWuxiaScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default NovelaWuxiaScraper;
