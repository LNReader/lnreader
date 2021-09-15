import cheerio from "react-native-cheerio";

const sourceId = 77;

const sourceName = "NovelDeGlace";

const baseUrl = "https://noveldeglace.com/";

const popularNovels = async (page) => {
    const totalPages = 1;

    let url = baseUrl + "roman";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("article").each(function () {
        const novelName = $(this).find("h2").text().trim();
        const novelCover = $(this).find("img").attr("src");
        const novelUrl = $(this).find("h2 > a").attr("href").split("/")[4];

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
    const url = baseUrl + "roman/" + novelUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = { sourceId, sourceName, url, novelUrl };

    novel.novelName = $(
        "div.entry-content > div > strong"
    )[0].nextSibling.nodeValue.trim();

    novel.novelCover = $(".su-row > div > div > img").attr("src");

    novel.summary = $("div[data-title=Synopsis]").text();

    author = $(
        "div.romans > div.project-large > div.su-row > div.su-column.su-column-size-3-4 > div > div:nth-child(3) > strong"
    )[0];

    novel.author = author ? author.nextSibling.nodeValue.trim() : null;

    novel.genre = $(".genre")
        .text()
        .replace("Genre : ", "")
        .replace(/, /g, ",");

    let novelChapters = [];

    $(".chpt").each(function () {
        const chapterName = $(this).find("a").text().trim();
        const releaseDate = null;
        const chapterUrl = $(this).find("a").attr("href");

        const novel = {
            sourceId,
            chapterName,
            releaseDate,
            chapterUrl,
        };

        novelChapters.push(novel);
    });

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = chapterUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("h2.western").text();
    let chapterText = $(".chapter-content").html();

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
    let url = baseUrl + "roman";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("article").each(function () {
        const novelName = $(this).find("h2").text().trim();
        const novelCover = $(this).find("img").attr("src");
        const novelUrl = $(this).find("h2 > a").attr("href").split("/")[4];

        const novel = {
            sourceId,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    novels = novels.filter((novel) =>
        novel.novelName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return novels;
};

const NovelDeGlaceScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default NovelDeGlaceScraper;
