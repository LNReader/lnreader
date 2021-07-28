import QueryString from "qs";
import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const sourceId = 68;

const sourceName = "Readwn.com";

const baseUrl = "https://www.readwn.com/";

const popularNovels = async (page) => {
    let url = `${baseUrl}list/all/all-onclick-${page - 1}.html`;
    const totalPages = 281;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("li.novel-item").each(function () {
        const novelName = $(this).find("h4").text();
        const novelUrl = $(this).find("a").attr("href").split("/").pop();

        const novelCover =
            baseUrl + $(this).find(".novel-cover > img").attr("data-src");
        console.log(novelCover);

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
    const url = `${baseUrl}novel/${novelUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {
        sourceId,
        sourceName,
        url,
        novelUrl,
    };

    novel.novelUrl = novelUrl;

    novel.novelName = $("h1.novel-title").text();

    novel.novelCover = baseUrl + $("figure.cover > img").attr("data-src");

    novel.summary = $("p.description").text().trim();

    novel.genre = "";

    $("div.categories > ul > li").each(function () {
        novel.genre += $(this).text().trim() + ",";
    });

    $("div.header-stats > span").each(function () {
        if ($(this).find("small").text() === "Status") {
            novel.status = $(this).find("strong").text();
        }
    });

    novel.genre = novel.genre.slice(0, -1);

    novel.author = $("span[itemprop=author]").text();

    let novelChapters = [];

    const novelId = novelUrl.split("/").pop().replace(".html", "");

    const latestChapterNumber = $(".header-stats")
        .find("span > strong")
        .first()
        .text()
        .trim();

    for (let i = 1; i <= latestChapterNumber; i++) {
        const chapterName = `Chapter ${i}`;
        const chapterUrl = `${novelId}_${i}`;
        const releaseDate = null;

        const chapter = { chapterName, releaseDate, chapterUrl };

        novelChapters.push(chapter);
    }

    novel.chapters = novelChapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}novel/${chapterUrl}.html`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    const chapterName = $(".titles > h2").text();
    let chapterText = htmlToText($(".chapter-content").html());

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
    const searchUrl = "https://www.readwn.com/e/search/index.php";

    const result = await fetch(searchUrl, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Referer: "https://www.readwn.com/search.html",
            Origin: "https://www.readwn.com",
        },
        method: "POST",
        body: QueryString.stringify({
            show: "title",
            tempid: 1,
            tbname: "news",
            keyboard: searchTerm,
        }),
    });
    const body = await result.text();

    console.log(body);

    $ = cheerio.load(body);

    let novels = [];

    $("li.novel-item").each(function () {
        const novelName = $(this).find("h4").text();
        const novelCover = baseUrl + $(this).find("img").attr("src");
        const novelUrl = $(this).find("a").attr("href").split("/").pop();

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

const ReadwnScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default ReadwnScraper;
