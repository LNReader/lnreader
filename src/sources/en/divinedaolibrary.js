import cheerio from "react-native-cheerio";

const sourceId = 70;

const sourceName = "Divine Dao Library";

const baseUrl = "https://www.divinedaolibrary.com/";

const popularNovels = async (page) => {
    let url = baseUrl + "novels";
    const totalPages = 1;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("#main")
        .find("li")
        .each(function () {
            const novelName = $(this).find("a").text();
            const novelCover = null;
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

    novel.novelName = $("h1.entry-title").text().trim();

    novel.novelCover =
        $(".entry-content").find("img").attr("src") ||
        "https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true";

    novel.summary = $("#main > article > div > p:nth-child(6)").text().trim();

    novel.genre = null;

    novel.status = null;

    novel.author = $("#main > article > div > h3:nth-child(2)")
        .text()
        .replace(/Author:/g, "")
        .trim();

    let novelChapters = [];

    $("#main")
        .find("li > span > a")
        .each(function () {
            const chapterName = $(this).text().trim();
            const releaseDate = null;
            const chapterUrl = $(this).attr("href");

            novelChapters.push({ chapterName, releaseDate, chapterUrl });
        });

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = chapterUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $(".entry-title").text().trim();

    let chapterText = $(".entry-content").html();

    if (!chapterText) {
        chapterText = $(".page-header").html();
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
    let url = baseUrl + "novels";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("#main")
        .find("li")
        .each(function () {
            const novelName = $(this).find("a").text();
            const novelCover = null;
            const novelUrl = $(this).find(" a").attr("href");

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

const DivineDaoLibraryScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default DivineDaoLibraryScraper;
