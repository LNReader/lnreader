import cheerio from "react-native-cheerio";
import { defaultCoverUri, Status } from "../helpers/constants";

const sourceId = 23;
const sourceName = "TuNovelaLigera";

const baseUrl = "https://tunovelaligera.com/";

const popularNovels = async (page) => {
    let totalPages = 62;
    let url = baseUrl + "novelas/page/" + page + "/?m_orderby=rating";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".page-item-detail").each(function () {
        const novelName = $(this).find(".h5 > a").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find(".h5 > a").attr("href").split("/")[4];
        novelUrl += "/";

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
    const url = `${baseUrl}novelas/${novelUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = { sourceId, sourceName, url };

    novel.novelUrl = novelUrl;

    $(".manga-title-badges").remove();

    novel.novelName = $(".post-title > h1").text().trim();

    novelCover = $(".summary_image > a > img");

    novel.novelCover =
        novelCover.attr("data-src") ||
        novelCover.attr("src") ||
        defaultCoverUri;

    $(".post-content_item").each(function () {
        const detailName = $(this).find(".summary-heading > h5").text().trim();
        const detail = $(this).find(".summary-content").text().trim();

        switch (detailName) {
            case "Generos":
                novel.genre = detail.replace(/, /g, ",");
                break;
            case "Autores":
                novel.author = detail;
                break;
            case "Estado":
                novel.status =
                    detail.includes("OnGoing") || detail.includes("Updating")
                        ? Status.ONGOING
                        : Status.COMPLETED;
                break;
        }
    });

    novel.summary = $("div.summary__content > p").text().trim();

    let novelChapters = [];

    const novelId =
        $(".rating-post-id").attr("value") ||
        $("#manga-chapters-holder").attr("data-id");

    let formData = new FormData();
    formData.append("action", "manga_get_chapters");
    formData.append("manga", novelId);

    const data = await fetch(
        "https://tunovelaligera.com/wp-admin/admin-ajax.php",
        {
            method: "POST",
            body: formData,
        }
    );
    const text = await data.text();

    $ = cheerio.load(text);

    $(".wp-manga-chapter").each(function (result) {
        chapterName = $(this)
            .find("a")
            .text()
            .replace(/[\t\n]/g, "")
            .trim();

        releaseDate = $(this).find("span").text().trim();

        chapterUrl = $(this).find("a").attr("href").split("/");

        chapterUrl[6]
            ? (chapterUrl = chapterUrl[5] + "/" + chapterUrl[6])
            : (chapterUrl = chapterUrl[5]);

        novelChapters.push({ chapterName, releaseDate, chapterUrl });
    });

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}novelas/${novelUrl}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("h1#chapter-heading").text();

    let chapterText = $(".text-left").html();
    novelUrl = novelUrl + "/";

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
    const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".c-tabs-item__content").each(function (result) {
        const novelName = $(this).find(".h4 > a").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find(".h4 > a").attr("href");
        novelUrl = novelUrl.replace(`${baseUrl}novelas/`, "");

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

const TuNovelaLigeraScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default TuNovelaLigeraScraper;
