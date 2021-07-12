import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const sourceId = 50;

const sourceName = "Novel Updates";

const baseUrl = "https://www.novelupdates.com/";

let headers = new Headers({
    "User-Agent":
        "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
});

const popularNovels = async (page) => {
    const totalPages = 100;
    let url = `${baseUrl}series-ranking/?rank=week&pg=` + page;

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

    novel.genre = $("#seriesgenre").text().trim().replace(/\s/g, ",");

    novel.status = $("#editstatus").text().includes("Ongoing")
        ? "Ongoing"
        : "Completed";

    let type = $("#showtype").text().trim();

    let summary = $("#editdescription").text().trim();

    novel.summary = `Type: ${type}\n` + summary;

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

    // console.log("Original URL: ", url);

    let result, body;

    try {
        result = await fetch(url, {
            method: "GET",
            headers: headers,
        });
        body = await result.text();
    } catch (error) {
        chapterText =
            "Chapter not available.\n\nReport if it's available in webview.";
    }

    // console.log("Redirected URL: ", result.url);

    $ = cheerio.load(body);

    let chapterName = "";

    let isWuxiaWorld = result.url.toLowerCase().includes("wuxiaworld");

    /**
     * Checks if its a wwordpress site
     */
    let isWordPress =
        $('meta[name="generator"]').attr("content") || $("footer").text();

    if (isWordPress) {
        isWordPress =
            isWordPress.toLowerCase().includes("wordpress") ||
            isWordPress.toLowerCase().includes("Site Kit by Google 1.36.0") ||
            $(".powered-by").text().toLowerCase().includes("wordpress") ||
            $(".entry-content").html() ||
            $("section.content").html()
                ? true
                : false;

        // console.log(isWordPress);
    }

    let isWebNovel = result.url.toLowerCase().includes("webnovel");

    if (isWuxiaWorld) {
        chapterText = $("#chapter-content").html();
    } else if (isWordPress) {
        /**
         * Remove wordpress bloat tags
         */
        $(".c-ads").remove();
        $("#madara-comments").remove();
        $(".sharedaddy").remove();

        chapterText = $(".entry-content").html();

        if (!chapterText) {
            chapterText = $("section.content").html();
        }

        if (!chapterText) {
            chapterText = $(".single_post").html();
        }

        /**
         * Format anchor tags properly Eg. [title](https://www.example.com)
         */
        // .replace(
        //     /<\s*a[^>]*href=['"](.*?)['"][^>]*>([\s\S]*?)<\/\s*a\s*>/gi,
        //     "[$2]($1)"
        // );
    } else if (isWebNovel) {
        chapterText = $(".cha-words").html();
    } else {
        /**
         * Remove unnecessary tags
         */
        const tags = ["nav", "header", "footer", ".hidden"];

        tags.map((tag) => $(tag).remove());

        chapterText = $("body").html();
    }

    if (!chapterText) {
        chapterText =
            "Chapter not available.\n\nReport if it's available in webview.";
    }

    chapterText = htmlToText(chapterText);

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
