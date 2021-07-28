import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";
import moment from "moment";
import { showToast } from "../../hooks/showToast";

const sourceId = 51;

const sourceName = "Ranobes";

const baseUrl = "https://ranobes.net/";

const popularNovels = async (page) => {
    const totalPages = 152;
    let url = `${baseUrl}novels/page/${page}`;

    let headers = new Headers({
        referer: "https://ranobes.net/",
        "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    });

    const result = await fetch(url, { method: "GET", headers: headers });
    const body = await result.text();

    let $ = cheerio.load(body);

    let novels = [];

    $("article.block.story.shortstory.mod-poster").each(function () {
        const novelName = $(this).find("h2.title").text();
        let novelCover = $(this).find("figure").attr("style");

        let novelUrl = $(this)
            .find("a")
            .attr("href")
            .replace(baseUrl + "novels/", "");

        novelCover = novelCover
            .match(/background-image: url(.*);/)[1]
            .slice(1, -1);

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
    showToast("Ranobes: Only has latest 25 chapters.");

    const url = `${baseUrl}novels/${novelUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    let $ = cheerio.load(body);

    let novel = {
        sourceId,
        sourceName,
        url,
        novelUrl,
    };

    novel.novelName = $('meta[property="og:title"]').attr("content");

    novel.novelCover = baseUrl + $(".poster > a > img").attr("src");

    novel.author = $("dl.author > dd").text();

    novel.genre = $(".book-generes").text().trim();

    novel.summary = $('div[itemprop="description"]').text().trim();

    novel.author = $('span[itemprop="author"]').text();
    novel.genre = $('span[itemprop="genre"]').text().replace(", ", ",");

    let tempNovelUrl = $(".r-fullstory-chapters-foot")
        .find("a")
        .next()
        .next()
        .attr("href")
        .split("/")[2];

    const chapterListUrl = `${baseUrl}up/${tempNovelUrl}/page/1`;

    const chaptersHtml = await fetch(chapterListUrl);
    const chapterHtmlToString = await chaptersHtml.text();

    $ = cheerio.load(chapterHtmlToString);

    // let lastPage = $("div.pages > a").last().text();

    let novelChapters = [];

    $("#dle-content > div.cat_block.cat_line").each(function () {
        const chapterName = $(this).find(".title").text();

        let releaseDate = new Date();

        let timeAgo = $(this).find("small").text();

        timeAgo = timeAgo.match(/\d+/)[0];

        if (timeAgo.includes("hours ago")) {
            releaseDate.setTime(releaseDate.getTime() - timeAgo);
        }

        if (timeAgo.includes("months ago")) {
            releaseDate.setMonth(releaseDate.getMonth() - timeAgo);
        }

        if (timeAgo.includes("days ago")) {
            releaseDate.setDate(releaseDate.getDate() - timeAgo);
        }

        releaseDate = moment(releaseDate).format("MM/DD/YY");

        const chapterUrl = $(this)
            .find("a")
            .attr("href")
            .replace(baseUrl + "up/", "");

        const chapter = {
            chapterName,
            releaseDate,
            chapterUrl,
        };

        novelChapters.push(chapter);
    });

    // for (i = 1; i <= lastPage; i++) {
    //     const chapterPageUrl = `${baseUrl}up/${tempNovelUrl}/page/${i}`;

    //     const chaptersHtml = await fetch(chapterPageUrl);
    //     const chapterHtmlToString = await chaptersHtml.text();
    //     $ = cheerio.load(chapterHtmlToString);

    //     $("#dle-content > div.cat_block.cat_line").each(function () {
    //         const chapterName = $(this).find(".title").text();

    //         let releaseDate = new Date();

    //         let timeAgo = $(this).find("small").text();

    //         timeAgo = timeAgo.match(/\d+/)[0];

    //         if (timeAgo.includes("hours ago")) {
    //             releaseDate.setTime(releaseDate.getTime() - timeAgo);
    //         }

    //         if (timeAgo.includes("months ago")) {
    //             releaseDate.setMonth(releaseDate.getMonth() - timeAgo);
    //         }

    //         if (timeAgo.includes("days ago")) {
    //             releaseDate.setDate(releaseDate.getDate() - timeAgo);
    //         }

    //         releaseDate = moment(releaseDate).format("MM/DD/YY");

    //         const chapterUrl = $(this)
    //             .find("a")
    //             .attr("href")
    //             .replace(baseUrl + "up/", "");

    //         const chapter = {
    //             chapterName,
    //             releaseDate,
    //             chapterUrl,
    //         };

    //         novelChapters.push(chapter);
    //     });
    // }

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}up/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("h1.title").text();

    let chapterText = $("#arrticle").html();
    chapterTextRaw = chapterText;
    chapterText = htmlToText(chapterText);

    const chapter = {
        sourceId,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
        chapterTextRaw,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    /**
     * TODO
     */

    showToast("Ranobes: Search does not work");
    return [];
};

const RanobesScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default RanobesScraper;
