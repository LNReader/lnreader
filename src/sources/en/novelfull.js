import cheerio from "react-native-cheerio";

const baseUrl = "https://novelfull.com";

const popularNovels = async (page) => {
    let totalPages = 42;
    const url = `${baseUrl}/most-popular?page=${page}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.col-truyen-main > div.list-truyen > .row").each(function (result) {
        const novelName = $(this).find("h3.truyen-title > a").text();

        let novelCover = $(this).find("img").attr("src");
        novelCover = baseUrl + novelCover;

        let novelUrl = $(this)
            .find("h3.truyen-title > a")
            .attr("href")
            .replace(".html", "")
            .substring(1);
        novelUrl = `${novelUrl}/`;

        const novel = {
            sourceId: 8,
            novelUrl,
            novelName,
            novelCover,
        };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}/${novelUrl.slice(0, -1)}.html`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 8;

    novel.sourceName = "NovelFull";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("div.book > img").attr("alt");

    novel.novelCover = baseUrl + $("div.book > img").attr("src");

    novel.summary = $("div.desc-text").text().trim();

    novel.author = $("div.info > div > h3")
        .filter(function () {
            return $(this).text().trim() === "Author:";
        })
        .siblings()
        .text();

    novel.genre = $("div.info > div")
        .filter(function () {
            return $(this).find("h3").text().trim() === "Genre:";
        })
        .text()
        .replace("Genre:", "");

    novel.artist = null;

    novel.status = $("div.info > div > h3")
        .filter(function () {
            return $(this).text().trim() === "Status:";
        })
        .next()
        .text();

    const novelId = $("#rating").attr("data-novel-id");

    const getChapters = async (novelId) => {
        const chapterListUrl =
            baseUrl + "/ajax/chapter-option?novelId=" + novelId;

        const data = await fetch(chapterListUrl);
        const chapters = await data.text();

        $ = cheerio.load(chapters);

        let novelChapters = [];

        $("select > option").each(function (result) {
            let chapterName = $(this).text();
            let releaseDate = null;
            let chapterUrl = $(this).attr("value");
            chapterUrl = chapterUrl.replace(`/${novelUrl}`, "");

            novelChapters.push({
                chapterName,
                releaseDate,
                chapterUrl,
            });
        });
        return novelChapters;
    };

    novel.chapters = await getChapters(novelId);

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}/${novelUrl}${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    const chapterName = $(".chapter-title").attr("title");
    let chapterText = $("#chapter-content").html();
    const chapter = {
        sourceId: 8,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const searchUrl = `https://novelfull.com/search?keyword=`;

    const url = `${searchUrl}${searchTerm}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.col-truyen-main > div.list-truyen > .row").each(function (result) {
        let novelUrl = $(this)
            .find("h3.truyen-title > a")
            .attr("href")
            .replace(".html", "")
            .substring(1);
        novelUrl = `${novelUrl}/`;

        const novelName = $(this).find("h3.truyen-title > a").text();
        const novelCover = baseUrl + $(this).find("img").attr("src");

        const novel = {
            sourceId: 8,
            novelUrl,
            novelName,
            novelCover,
        };

        novels.push(novel);
    });

    return novels;
};

const novelFullScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default novelFullScraper;
