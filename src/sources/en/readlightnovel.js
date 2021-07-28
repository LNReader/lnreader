import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const sourceId = 2;

const sourceName = "ReadLightNovel";

const lang = "en";

const baseUrl = "https://www.readlightnovel.org";

const searchUrl = "https://www.readlightnovel.org/detailed-search";

const popularNovels = async (page) => {
    let totalPages = 1751;
    const url = `${baseUrl}/top-novel/${page}`;

    const result = await fetch(url);
    const body = await result.text();

    const $ = cheerio.load(body);

    const novels = [];

    $(".top-novel-block").each(function (result) {
        const novelName = $(this).find("h2 > a").text();
        const novelCover = $(this).find("img").attr("src");
        const novelUrl = $(this)
            .find("h2 > a")
            .attr("href")
            .replace(`${baseUrl}/`, "");

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
    const url = `${baseUrl}/${novelUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel;

    const novelName = $(".block-title > h1").text();

    const novelCover = $(".novel-cover > a > img").attr("src");

    let author, artist, genre, summary, status;

    $(".novel-detail-item").each(function (result) {
        const detailName = $(this).find(".novel-detail-header > h6").text();
        const detail = $(this).find(".novel-detail-body").text().trim();

        switch (detailName) {
            case "Genre":
                genre = detail.replace(/[\t\n]/g, ",");
                break;
            case "Author(s)":
                author = detail;
                break;
            case "Artist(s)":
                artist = detail;
                break;
            case "Description":
                summary = detail;
                break;
            case "Status":
                status = detail;
                break;
        }
    });

    let chapters = [];

    $(".panel").each(function (res) {
        let volumeName = $(this).find("h4.panel-title").text();

        $(this)
            .find("ul.chapter-chs > li")
            .each(function (result) {
                let chapterName = $(this).find("a").text();

                const releaseDate = null;

                const chapterUrl = $(this)
                    .find("a")
                    .attr("href")
                    .replace(`${baseUrl}/${novelUrl}/`, "");

                if (volumeName.includes("Volume")) {
                    chapterName = volumeName + " " + chapterName;
                }

                const chapter = {
                    chapterName,
                    releaseDate,
                    chapterUrl,
                };

                chapters.push(chapter);
            });
    });

    novel = {
        sourceId,
        sourceName,
        url,
        novelUrl,
        novelName,
        novelCover,
        genre,
        author,
        status,
        artist,
        summary,
        chapters,
    };

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}/${novelUrl}/${chapterUrl}/`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    $(".block-title > h1").find("a").remove();

    const chapterName = $(".block-title > h1").text().replace(" - ", "");

    $(".alert").remove();
    $(".hidden").remove();
    $("iframe").remove();
    $("button").remove();
    $(
        'div[style="float: left; margin-top: 20px; font-style: italic;margin-left: 50px; font-size: 14px;"]'
    ).remove();

    let chapterText = $(".desc").html();

    chapterTextRaw = chapterText;
    chapterText = htmlToText(chapterText);

    const chapter = {
        sourceId: 2,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
        chapterTextRaw,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const formData = new FormData();
    formData.append("keyword", searchTerm);
    formData.append("search", 1);

    const result = await fetch(searchUrl, {
        method: "POST",
        body: formData,
    });
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".top-novel-block").each(function (result) {
        const novelName = $(this).find(".top-novel-header > h2 > a").text();
        const novelCover = $(this).find("img").attr("src");

        const novelUrl = $(this)
            .find(".top-novel-header > h2 > a")
            .attr("href")
            .replace(`${baseUrl}/`, "");

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

const ReadLightNovelScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default ReadLightNovelScraper;
