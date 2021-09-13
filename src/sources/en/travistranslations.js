import cheerio from "react-native-cheerio";

const sourceId = 76;

const sourceName = "TravisTranslations";

const baseUrl = "https://travistranslations.com/";

const popularNovels = async (page) => {
    let url = baseUrl + "all-series/";

    if (page > 1) {
        url += `page/${page}/`;
    }

    const totalPages = 19;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".group").each(function () {
        const novelName = $(this).find("h3").text();
        const novelCover = "https://" + $(this).find("img").attr("data-src");
        const novelUrl = $(this).find(" a").attr("href");

        const novel = {
            sourceId,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { novels, totalPages };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = novelUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = { sourceId, sourceName, url, novelUrl };

    novel.novelName = $("h1").text().trim();

    novel.novelCover = "https://" + $("img.object-cover").attr("data-src");

    novel.summary = $("div[property=description]").text().trim();

    novel.genre = "";

    $("div.flex.flex-col.mt-3.text-center > ul > li").each(function () {
        novel.genre +=
            $(this)
                .text()
                .replace(/[\t\n]/g, "") + ",";
    });
    $("div.header-stats > span").each(function () {
        if ($(this).find("small").text() === "Status") {
            novel.status = $(this).find("strong").text();
        }
    });

    novel.genre = novel.genre.slice(0, -1);

    novel.author = $(".author > a > span").text();
    let novelChapters = [];

    $(".tab_content > ul.grid")
        .find("li")
        .each(function () {
            const chapterName = $(this).find("span").first().text().trim();
            const releaseDate = null;
            const chapterUrl = $(this).find("a").attr("href");

            novelChapters.push({ chapterName, releaseDate, chapterUrl });
        });

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const result = await fetch(chapterUrl);
    let body = await result.text();

    $ = cheerio.load(body);

    const chapterId = $("input[name=id]").attr("value");

    const url =
        "https://travistranslations.com/wp-json/wp/v2/posts/" + chapterId;

    const data = await fetch(url);
    body = await data.json();

    let chapterName = body.title.rendered;
    let chapterText = body.content.rendered;

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
    let url = baseUrl + "all-series/?search=" + searchTerm;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".group").each(function () {
        const novelName = $(this).find("h3").text();
        const novelCover = "https://" + $(this).find("img").attr("data-src");
        const novelUrl = $(this).find(" a").attr("href");

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

const TravisTranslationsScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default TravisTranslationsScraper;
