import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://woopread.com/";

const popularNovels = async (page) => {
    let url = baseUrl + "novellist/page/" + page + "/?m_orderby=rating";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".page-item-detail").each(function (result) {
        const novelName = $(this).find(".h5 > a").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find(".h5 > a").attr("href");
        novelUrl = novelUrl.replace(baseUrl + "series/", "");

        const novel = {
            sourceId: 21,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}series/${novelUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 21;

    novel.sourceName = "WoopRead";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $(".post-title > h1")
        .text()
        .replace(/[\t\n]/g, "")
        .trim();

    novel.novelCover = $(".summary_image > a > img").attr("src");

    $(".post-content_item").each(function (result) {
        detailName = $(this)
            .find(".summary-heading > h5")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();
        detail = $(this)
            .find(".summary-content")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();

        switch (detailName) {
            case "Genre(s)":
                novel.genre = detail.trim().replace(/[\t\n]/g, ",");
                break;
            case "Author(s)":
                novel.author = detail.trim();
                break;
            case "Artist(s)":
                novel.status = detail.trim();
                break;
        }
    });
    $(".description-summary > div.summary__content").find("em").remove();

    novel.summary = $(".description-summary > div.summary__content")
        .text()
        .trim();

    let novelChapters = [];

    const novelId = $(".rating-post-id").attr("value");

    let formData = new FormData();
    formData.append("action", "manga_get_chapters");
    formData.append("manga", novelId);

    const data = await fetch("https://woopread.com/wp-admin/admin-ajax.php", {
        method: "POST",
        body: formData,
    });
    const text = await data.text();

    $ = cheerio.load(text);

    $(".wp-manga-chapter.free-chap").each(function (result) {
        chapterName = $(this)
            .find("a")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();

        releaseDate = $(this).find("span").text().replace("Free", "").trim();

        chapterUrl = $(this).find("a").attr("href").replace(url, "");

        novelChapters.push({ chapterName, releaseDate, chapterUrl });
    });

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}series/${novelUrl}/${chapterUrl}/`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    const chapterName = $("h1#chapter-heading").text();
    let chapterText = $(".reading-content").html();
    chapterText = htmlToText(chapterText);
    chapterText = chapterText.replace(/(?<=[[])[\n](?=[h])/g, "");

    let nextChapter = null;

    if ($(".nav-next").length) {
        nextChapter = $(".nav-next")
            .find("a")
            .attr("href")
            .replace(baseUrl + "series/" + novelUrl + "/", "");
    }

    let prevChapter = null;

    if ($(".nav-previous").length) {
        prevChapter = $(".nav-previous")
            .find("a")
            .attr("href")
            .replace(baseUrl + "series/" + novelUrl + "/", "");
    }

    const chapter = {
        sourceId: 21,
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
    const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga&op=&author=&artist=&release=&adult=`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".c-tabs-item__content").each(function (result) {
        const novelName = $(this).find(".h4 > a").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find(".h4 > a").attr("href");
        novelUrl = novelUrl.replace(`${baseUrl}series/`, "");

        const novel = {
            sourceId: 21,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const WoopReadScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default WoopReadScraper;
