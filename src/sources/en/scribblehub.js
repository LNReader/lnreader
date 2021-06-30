import cheerio from "react-native-cheerio";
import { htmlToText } from "../helpers/htmlToText";

const baseUrl = "https://www.scribblehub.com/";

const popularNovels = async (page) => {
    const totalPages = 326;
    let url = baseUrl + "series-ranking/?sort=1&order=4&pg=" + page;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.search_main_box").each(function (result) {
        const novelName = $(this).find("div.search_title > a").text();
        const novelCover = $(this).find("div.search_img > img").attr("src");

        let novelUrl = $(this).find("div.search_title > a").attr("href");
        novelUrl = novelUrl.split("/");
        novelUrl = novelUrl[4] + "-" + novelUrl[5];

        const novel = {
            sourceId: 35,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = baseUrl + "read/" + novelUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 35;

    novel.sourceName = "Scribble Hub";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("div.fic_title").text();

    novel.novelCover = $("div.fic_image > img").attr("src");

    novel.summary = $("div.wi_fic_desc").text();

    novel.genre = "";
    $("span.wi_fic_genre")
        .find("span")
        .each(function (res) {
            novel.genre += $(this).text() + ",";
        });
    if (novel.genre) {
        novel.genre = novel.genre.slice(0, -1);
    }

    novel.author = $("span.auth_name_fic").text();

    let formData = new FormData();
    formData.append("action", "wi_getreleases_pagination");
    formData.append("pagenum", "-1");
    formData.append("mypostid", novelUrl.split("-")[0]);

    const data = await fetch(
        "https://www.scribblehub.com/wp-admin/admin-ajax.php",
        {
            method: "POST",
            body: formData,
        }
    );
    const text = await data.text();

    $ = cheerio.load(text);

    let novelChapters = [];

    $(".toc_w").each(function (result) {
        const chapterName = $(this).find(".toc_a").text();
        const releaseDate = $(this).find(".fic_date_pub").text();

        const chapterUrl = $(this).find("a").attr("href").split("/")[6];
        // .replace("/novel/" + novelUrl + "/", "");

        novelChapters.push({
            chapterName,
            releaseDate,
            chapterUrl,
        });
    });

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}read/${novelUrl}/chapter/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("div.chapter-title").text();

    let chapterText = $("div.chp_raw").html();
    chapterText = htmlToText(chapterText);

    let nextChapter = null;
    let prevChapter = null;

    const chapter = {
        sourceId: 35,
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
    const url =
        "https://www.scribblehub.com/?s=" +
        searchTerm +
        "&post_type=fictionposts";

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $("div.search_main_box").each(function (result) {
        const novelName = $(this).find("div.search_title > a").text();
        const novelCover = $(this).find("div.search_img > img").attr("src");

        let novelUrl = $(this).find("div.search_title > a").attr("href");
        novelUrl = novelUrl.split("/");
        novelUrl = novelUrl[4] + "-" + novelUrl[5];

        const novel = {
            sourceId: 35,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });
    return novels;
};

const ScribbleHubScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default ScribbleHubScraper;
