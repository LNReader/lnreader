import cheerio from "react-native-cheerio";

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

    novel.summary = summary + `\nType: ${type}`;

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

    let chapterName = "";

    try {
        result = await fetch(url, {
            method: "GET",
            headers: headers,
        });
        body = await result.text();

        // console.log("Redirected URL: ", result.url);

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
                $(".powered-by").text().toLowerCase().includes("wordpress");
        }

        let isRainOfSnow = result.url.toLowerCase().includes("rainofsnow");

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
        } else if (isWordPress) {
            /**
             * Remove wordpress bloat tags
             */

            const bloatClasses = [
                ".c-ads",
                "#madara-comments",
                "#comments",
                ".content-comments",
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
                $(".main-content").html() ||
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
