import cheerio from "react-native-cheerio";

import moment from "moment";

const sourceId = 49;

const sourceName = "wuxia.city";

const baseUrl = "https://wuxia.city/";

const popularNovels = async (page) => {
    const totalPages = 133;
    let url = `${baseUrl}genre/all?page=` + page;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".section-item.card").each(function () {
        const novelName = $(this).find(".book-name").text();
        const novelCover = $(this).find("img").attr("src");
        const novelUrl = $(this).find("a").attr("href").replace("/book/", "");

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
    const url = `${baseUrl}book/${novelUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    let $ = cheerio.load(body);

    let novel = {
        sourceId,
        sourceName,
        url,
        novelUrl,
    };

    novel.novelName = $("h1.book-name").text();

    novel.novelCover = $("div.book-img > img").attr("src");

    novel.author = $("dl.author > dd").text();

    novel.genre = $(".book-generes").text().trim();

    novel.summary = $(".book-synopsis").text().replace("Synopsis", "").trim();

    const chapterListUrl = `${baseUrl}book/${novelUrl}/chapter-list`;

    const chaptersHtml = await fetch(chapterListUrl);
    const chapterHtmlToString = await chaptersHtml.text();

    $ = cheerio.load(chapterHtmlToString);

    let novelChapters = [];

    $("ul.chapters > li").each(function () {
        const chapterName = $(this)
            .find(".chapter-name")
            .text()
            .trim()
            .replace(/\n/, " ");

        let releaseDate = new Date();

        let timeAgo = $(this).find(".chapter-time").text();

        timeAgo = timeAgo.replace("one", 1);

        timeAgo = timeAgo.match(/\d+/)[0];

        if (timeAgo.includes("months ago") || timeAgo.includes("month ago")) {
            releaseDate.setMonth(releaseDate.getMonth() - timeAgo);
        }

        if (timeAgo.includes("days ago")) {
            releaseDate.setDate(releaseDate.getDate() - timeAgo);
        }

        releaseDate = moment(releaseDate).format("MM/DD/YY");

        const chapterUrl = $(this).find("a").attr("href").split("/").pop();

        const chapter = {
            chapterName,
            releaseDate,
            chapterUrl,
        };

        novelChapters.push(chapter);
    });

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}book/${novelUrl}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $(".chapter-name").text();

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
    const url = `${baseUrl}search?q=${searchTerm}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".section-item").each(function () {
        const novelName = $(this).find(".book-name").text().trim();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find("a").attr("href").replace("/book/", "");

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

const WuxiaCityScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default WuxiaCityScraper;
