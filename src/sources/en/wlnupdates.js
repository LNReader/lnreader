import cheerio from "react-native-cheerio";
import { Status } from "../helpers/constants";
import { htmlToText } from "../helpers/htmlToText";

const sourceId = 62;

const sourceName = "WLNUpdates";

const baseUrl = "https://www.wlnupdates.com/";

let headers = new Headers({
    "User-Agent":
        "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
});

const popularNovels = async (page) => {
    const totalPages = 100;
    let url = `${baseUrl}highest-rated/` + page;

    const result = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await result.text();

    const $ = cheerio.load(body);

    const novels = [];

    $("table").find("tr").first().remove();

    $("tr").each(function (res) {
        const novelCover =
            "https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true";

        const novelName = $(this).find("td > a").text();
        const novelUrl =
            "https://www.wlnupdates.com" + $(this).find("td > a").attr("href");

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
    const url = novelUrl;

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

    novel.novelName = $("h2").text();

    novel.novelCover =
        "https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true";

    novel.author = $(".multiitem#author")
        .text()
        .trim()
        .replace(/[\t\n]/g, "");

    novel.genre = $(".multiitem#genre")
        .text()
        .trim()
        .replace(/[\t\n]/g, "");

    novel.status = Status.UNKNOWN;

    let summary = $("#description").text().trim();

    novel.summary = summary;

    let novelChapters = [];

    $("#release-entry").each(function () {
        let chapterName;

        if ($(this).find("td.numeric").length > 1) {
            chapterName =
                "Volume " +
                $(this).find(" td:nth-child(3)").text().trim() +
                " Chapter " +
                $(this).find(" td:nth-child(4)").text().trim();
        } else if ($(this).find("td.numeric").length > 0) {
            chapterName = "Chapter " + $(this).find("td.numeric").text().trim();
        } else {
            chapterName = $(this).find("td.postfix").text().trim();
        }

        const releaseDate = $(this).find(".release-entry-cell").text().trim();

        const chapterUrl = $(this).find("td:nth-child(1) > a").attr("href");

        novelChapters.push({ chapterName, releaseDate, chapterUrl });
    });

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = chapterUrl;
    let result, body;

    let chapterName = "";

    try {
        result = await fetch(url, {
            method: "GET",
            headers: headers,
        });
        body = await result.text();

        $ = cheerio.load(body);

        let isWuxiaWorld = result.url.toLowerCase().includes("wuxiaworld");

        let isBlogspot = result.url.toLowerCase().includes("blogspot");

        let isTumblr = result.url.toLowerCase().includes("tumblr");

        /**
         * Checks if its a wwordpress site
         */
        let isWordPress =
            $('meta[name="generator"]').attr("content") || $("footer").text();

        if (isWordPress) {
            isWordPress =
                isWordPress.toLowerCase().includes("wordpress") ||
                isWordPress.includes("Site Kit by Google") ||
                $(".powered-by").text().toLowerCase().includes("wordpress") ||
                $(".entry-content").html() ||
                $("section.content").html()
                    ? true
                    : false;
        }

        let isRainOfSnow = result.url.toLowerCase().includes("rainofsnow");
        let isRoyalRoad = result.url.toLowerCase().includes("royalroad");

        let isWebNovel = result.url.toLowerCase().includes("webnovel");

        let isHostedNovel = result.url.toLowerCase().includes("hostednovel");

        let isScribbleHub = result.url.toLowerCase().includes("scribblehub");

        if (isWuxiaWorld) {
            chapterText = $("#chapter-content").html();
        } else if (isRainOfSnow) {
            chapterText = $("div.content").html();
        } else if (isTumblr) {
            chapterText = $(".post").html();
        } else if (isBlogspot) {
            chapterText = $(".entry-content").html();
        } else if (isHostedNovel) {
            chapterText = $(".chapter").html();
        } else if (isScribbleHub) {
            chapterText = $("div.chp_raw").html();
        } else if (isRoyalRoad) {
            chapterText = $("div.chapter-content").html();
        } else if (isWordPress) {
            /**
             * Remove wordpress bloat tags
             */

            const bloatClasses = [
                ".c-ads",
                "#madara-comments",
                "#comments",
                ".sharedaddy",
                ".wp-dark-mode-switcher",
                ".wp-next-post-navi",
                ".wp-block-buttons",
                ".wp-block-columns",
                ".post-cats",
                ".sidebar",
                ".author-avatar",
            ];

            bloatClasses.map((tag) => $(tag).remove());

            chapterText =
                $(".entry-content").html() ||
                $(".single_post").html() ||
                $(".post-entry").html() ||
                $("article.post").html() ||
                $(".content").html() ||
                $("#content").html();
        } else if (isWebNovel) {
            chapterText = $(".cha-words").html();

            if (!chapterText) {
                chapterText = $("._content").html();
            }
        } else {
            /**
             * Remove unnecessary tags
             */
            const tags = ["nav", "header", "footer", ".hidden"];

            tags.map((tag) => $(tag).remove());

            chapterText = $("body").html();
        }

        if (chapterText) {
            /**
             * Remove patreon/discord links
             */
            chapterText = chapterText.replace(
                /<\s*a[^>]*href=['"](https:\/\/(?:www.|patreon|discord).*?)['"][^>]*>([\s\S]*?)<\/\s*a\s*>/gi,
                ""
            );

            chapterTextRaw = chapterText;
            chapterText = htmlToText(chapterText);
        } else {
            if (!chapterText) {
                chapterText =
                    "Chapter not available.\n\nReport if it's available in webview.";
            }
        }
    } catch (error) {
        chapterText = `Chapter not available (Error: ${error.message}).\n\nReport if it's available in webview.`;
    }

    const chapter = {
        sourceId,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
        chapterTextRaw: chapterTextRaw || chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = baseUrl + "search?title=" + searchTerm;

    const res = await fetch(url, {
        method: "GET",
        headers: headers,
    });
    const body = await res.text();

    $ = cheerio.load(body);

    let novels = [];

    $("tr").each(function (res) {
        const novelCover =
            "https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true";
        const novelName = $(this).find("td > a").text();
        const novelUrl =
            "https://www.wlnupdates.com" + $(this).find("td > a").attr("href");

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

const WLNUpdatesScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default WLNUpdatesScraper;
