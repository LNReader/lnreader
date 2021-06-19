import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const sourceId = 2;

const sourceName = "ReadLightNovel";

const lang = "en";

const baseUrl = "https://www.readlightnovel.org";

const searchUrl = "https://www.readlightnovel.org/detailed-search";

const popularNovels = async (page) => {
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

    return novels;
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
        const detail = $(this).find(".novel-detail-body").text();

        switch (detailName) {
            case "Genre":
                genre = detail.trim().replace(/[\t\n]/g, ",");
                break;
            case "Author(s)":
                author = detail.trim();
                break;
            case "Artist(s)":
                artist = detail.trim();
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

    $(".desc")
        .find("hr")
        .each(function (result) {
            $(this).remove();
        });

    $(".alert").remove();
    $(".hidden").remove();

    var re = new RegExp(String.fromCharCode(160), "g");

    let chapterText = $(".desc").html();

    chapterText = htmlToText(chapterText).replace(
        /\n\nSponsored Content\n\n|If audio player doesn't work, press Stop then Play button again/g,
        ""
    );

    let nextChapter = null;

    if ($("a.next.next-link").length) {
        nextChapter = $("a.next.next-link")
            .attr("href")
            .replace(`${baseUrl}/${novelUrl}/`, "");
    }

    let prevChapter = null;

    if ($("a.prev.prev-link").length) {
        prevChapter = $("a.prev.prev-link")
            .attr("href")
            .replace(`${baseUrl}/${novelUrl}/`, "");
    }

    const chapter = {
        sourceId: 2,
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
