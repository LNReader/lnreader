import cheerio from "react-native-cheerio";

const baseUrl = "https://wuxiaworldsite.co/";
const searchUrl = "https://wuxiaworldsite.co/search/";

const popularNovels = async (page) => {
    let totalPages = 222;
    const url = `https://wuxiaworldsite.co/ajax-story-power.ajax`;

    const formData = new FormData();
    formData.append("page", page);
    formData.append("keyword", "");
    formData.append("count", 18);
    formData.append("genres_include", "");
    formData.append("limit", 18);
    formData.append("order_type", "DESC");
    formData.append("order_by", "views");

    const result = await fetch(url, { method: "POST", body: formData });
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".a_item").each((i, el) => {
        const novelName = $(el).find("a").attr("title");
        const novelCover = baseUrl + $(el).find("a > img").attr("src");

        let novelUrl = $(el).find(".name_views > a").attr("href");
        novelId = novelUrl.split("/");
        novelUrl = novelId[2] + "/";

        const novel = {
            sourceId: 12,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = `${baseUrl}${novelUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    $(".category_list").remove();

    let novel = {};

    novel.sourceId = 12;

    novel.sourceName = "WuxiaWorldSite";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $(".content-reading > h1").text().trim();

    novel.novelCover = baseUrl + $(".img-read> img").attr("src");

    novel.summary = $(".story-introduction-content").text();

    novel.author = $(".content-reading > p").text().trim();

    novel.artist = null;

    novel.genre = "";

    $(".a_tag_item").each((i, el) => {
        novel.genre += $(el).text() + ",";
    });

    novel.genre = novel.genre.split(",");
    novel.genre.pop();

    novel.status = novel.genre.pop();

    novel.genre = novel.genre.join(",");

    const novelID = $(".show-more-list").attr("data-id");

    const getChapters = async (novelID) => {
        const chapterListUrl = baseUrl + "/get-full-list.ajax?id=" + novelID;

        const data = await fetch(chapterListUrl);
        const chapters = await data.text();

        $ = cheerio.load(chapters);

        let novelChapters = [];

        $(".new-update-content").each((i, el) => {
            let chapterName = $(el).text().split(/\t+/);
            const releaseDate = chapterName.pop();
            chapterName = chapterName[0];
            let chapterUrl = $(el).attr("href");
            chapterUrl = chapterUrl.split("/").pop();

            const novel = {
                chapterName,
                releaseDate,
                chapterUrl,
            };
            novelChapters.push(novel);
        });
        return novelChapters;
    };

    novel.chapters = await getChapters(novelID);

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}/${novelUrl}/${chapterUrl}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let chapterName = $("h1.text-center.heading_read").text();
    let chapterText = $(".content-story").html();

    novelUrl += "/";
    chapterUrl += "/";

    const chapter = {
        sourceId: 12,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = `${searchUrl}${searchTerm}`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".a_item").each((i, el) => {
        const novelName = $(el).find(".name_views > a").attr("title");
        const novelCover = baseUrl + $(el).find("a > img").attr("src");
        let novelUrl = $(el).find(".name_views > a").attr("href");
        novelId = novelUrl.split("/");
        novelUrl = novelId[2] + "/";

        const novel = {
            sourceId: 12,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const WuxiaWorldSiteScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default WuxiaWorldSiteScraper;
