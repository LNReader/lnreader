import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://tunovelaligera.com/";

const popularNovels = async (page) => {
    let totalPages = 1;
    let url = baseUrl + "mejores-novelas-originales/";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".page-item-detail").each(function (result) {
        const novelName = $(this).find(".h5 > a").text();
        const novelCover = $(this).find("img").attr("src");

        let novelUrl = $(this).find(".h5 > a").attr("href").split("/")[4];
        novelUrl += "/";

        const novel = {
            sourceId: 23,
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

    let novel = {};

    novel.sourceId = 23;

    novel.sourceName = "Tunovelaligera";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("h1.titulo-novela")
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

        novel[detailName] = detail;
    });

    novel.genre = novel.Generos.replace(/, /g, ",");
    novel.author = novel.Autores;
    novel.status = novel.Estado;
    novel.status = null;

    novel.artist = novel["Artista(s)"];

    delete novel.Genre;
    delete novel["Artista(s)"];
    delete novel.Autores;
    delete novel.Estado;

    let novelSummary = "";

    $(".summary__content")
        .find("p")
        .each(function () {
            novelSummary += $(this).html();
        });

    novel.summary = htmlToText(novelSummary);

    let novelChapters = [];

    const novelId = $(".wp-manga-action-button").attr("data-post");

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
    chapterTextRaw = chapterText;
    chapterText = htmlToText(chapterText);

    novelUrl = novelUrl + "/";

    const chapter = {
        sourceId: 23,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
        chapterTextRaw,
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
            sourceId: 23,
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
