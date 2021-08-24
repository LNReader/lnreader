import cheerio from "react-native-cheerio";
import { Status } from "../helpers/constants";

const sourceId = 71;
const sourceName = "NovelOnlineFull.com";
const baseUrl = "https://novelonlinefull.com/";

const popularNovels = async (page) => {
    let url =
        baseUrl + "novel_list?type=topview&category=all&state=all&page=" + page;
    const totalPages = 2155;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".update_item.list_category").each(function () {
        const novelName = $(this).find("h3").text().trim();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find("h3 > a").attr("href");
        novelUrl = novelUrl.replace(baseUrl + "novel/", "");

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
    const url = baseUrl + "novel/" + novelUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = { sourceId, sourceName, url, novelUrl };

    novel.novelName = $("h1").text().trim();

    novel.novelCover = $(".info_image > img").attr("src");

    novel.summary = $("#noidungm").text().trim();

    novel.genre = $("div.truyen_if_wrap > ul > li:nth-child(3)")
        .text()
        .replace("GENRES: ", "")
        .replace(/ - /g, ",")
        .trim();

    console.log(novel.genre);

    novel.status =
        $(" div.truyen_if_wrap > ul > li:nth-child(4) > a")
            .text()
            .replace("STATUS", "")
            .trim() === "ONGOING"
            ? Status.ONGOING
            : Status.COMPLETED;

    novel.author = $("div.truyen_if_wrap > ul > li:nth-child(2)")
        .text()
        .replace("Author(s):", "")
        .trim();

    let novelChapters = [];

    $(".chapter-list")
        .find(".row")
        .each(function () {
            const releaseDate = $(this).find("span:nth-child(2)").text();

            const chapterName = $(this).find("span:nth-child(1) > a").text();
            const chapterUrl = $(this).find("a").attr("href");

            novelChapters.push({
                chapterName,
                chapterUrl,
                releaseDate,
            });
        });

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = chapterUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $(".name_chapter").text();
    let chapterText = $("#vung_doc").html();

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
    const url = baseUrl + "search_novels/" + searchTerm;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".update_item.list_category").each(function () {
        const novelName = $(this).find("h3").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find("h3 > a").attr("href");
        novelUrl = novelUrl.replace(baseUrl + "novel/", "");

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

const NovelOnlineFullScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default NovelOnlineFullScraper;
