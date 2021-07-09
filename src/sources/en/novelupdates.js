import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";
import moment from "moment";

const sourceId = 50;

const sourceName = "Novel Updates";

const baseUrl = "https://www.novelupdates.com/";

let headers = new Headers({
    "User-Agent":
        "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
});

const popularNovels = async (page) => {
    const totalPages = 100;
    let url = `${baseUrl}series-ranking/?rank=sixmonths&pg=` + page;

    const result = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await result.text();

    const $ = cheerio.load(body);

    const novels = [];

    $("div.search_main_box_nu").each(function (res) {
        const novelCover = $(this).find("img").attr("src");
        const novelName = $(this).find(".search_title > a").text();
        const novelUrl = $(this)
            .find(".search_title > a")
            .attr("href")
            .split("/")[4];

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
    const url = `${baseUrl}series/${novelUrl}`;

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

    novel.novelName = $(".seriestitlenu").text();

    novel.novelCover = $(".seriesimg > img").attr("src");

    novel.author = $("#showauthors").text().trim();

    novel.genre = $(".book-generes").text().trim();

    novel.status = $("#editstatus").text().includes("Ongoing")
        ? "Ongoing"
        : "Completed";

    novel.summary = $("#editdescription").text().trim();

    let novelChapters = [];

    const novelId = $("input#mypostid").attr("value");

    let formData = new FormData();
    formData.append("action", "nd_getchapters");
    formData.append("mygrr", 0);
    formData.append("mypostid", parseInt(novelId));

    const data = await fetch(
        "https://www.novelupdates.com/wp-admin/admin-ajax.php",
        {
            method: "POST",
            headers,
            body: formData,
        }
    );
    const text = await data.text();

    $ = cheerio.load(text);

    $("li.sp_li_chp").each(function () {
        const chapterName = $(this).text().trim();

        const releaseDate = null;

        const chapterUrl =
            "https:" + $(this).find("a").first().next().attr("href");

        novelChapters.push({ chapterName, releaseDate, chapterUrl });
    });

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = chapterUrl;

    const result = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = "";

    let chapterText = body;

    let nextChapter = null;
    let prevChapter = null;

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
    const url =
        "https://www.novelupdates.com/?s=" +
        searchTerm +
        "&post_type=seriesplans";

    const res = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await res.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.search_main_box_nu").each(function (res) {
        const novelCover = $(this).find("img").attr("src");
        const novelName = $(this).find(".search_title > a").text();
        const novelUrl = $(this)
            .find(".search_title > a")
            .attr("href")
            .split("/")[4];

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

const NovelUpdatesScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default NovelUpdatesScraper;
