import cheerio from "react-native-cheerio";

const baseUrl = "https://m.yushubo.com";

const popularNovels = async (page) => {
    const url = `${baseUrl}/all/order/hits_week+desc.html?page=${page}`;
    const totalPages = 5846;

    const result = await fetch(url, {
        headers: {
            "User-Agent":
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
        },
    });
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".clearfix > li").each(function (result) {
        const novelUrl =
            $(this).find("a").attr("href").replace(".html", "").substring(1) +
            "/";

        const novelName = $(this).find("a").text();
        let novelCover = $(this).find("img").attr("src");
        novelCover = novelCover.includes("https://tva1.sinaimg.cn/")
            ? `${novelCover}`
            : `${baseUrl}${novelCover}`;

        const novel = {
            extensionId: 52,
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

    const result = await fetch(url, {
        headers: {
            "User-Agent":
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
        },
    });
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = {};

    novel.sourceId = 52;

    novel.sourceName = "Yushubo";

    novel.url = url;

    novel.novelUrl = novelUrl;

    novel.novelName = $("dd > h2").text();

    novel.novelCover = $("dt > img").attr("src");

    novel.summary = $("div.content > p").text();

    let info = [];
    $(".info a").each(function (result) {
        info.push($(this).text());
    });

    novel.genre = info[0];

    novel.author = info[1];

    novel.artist = null;

    novel.status = "Unknown";

    let chapters = [];

    $(".bookshelf-list a").each(function (result) {
        let chapterUrl = $(this).attr("href").substring(1);
        let chapterName = $(this).attr("title");
        let releaseDate = null;

        chapters.push({
            chapterName,
            releaseDate,
            chapterUrl,
        });
    });

    novel.chapters = chapters;

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = `${baseUrl}/${chapterUrl}`;

    const result = await fetch(url, {
        headers: {
            "User-Agent":
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
        },
    });
    const body = await result.text();

    $ = cheerio.load(body);

    const chapterName = $(".read-section h3").text();
    let chapterText = "";
    $(".read-section p").each(function (result) {
        chapterText += `${$(this).text()}\n`;
    });

    const nextChapter = null;
    const prevChapter = null;

    const chapter = {
        extensionId: 52,
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
    const searchUrl = `${baseUrl}/search.html`;

    const result = await fetch(searchUrl, {
        method: "post",
        body: JSON.stringify({ keyword: searchTerm }),
        headers: {
            "User-Agent":
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
            "Content-Type": "application/json",
        },
    });

    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".clearfix > li").each(function (result) {
        let novelUrl =
            $(this).find("a").attr("href").replace(".html", "").substring(1) +
            "/";

        const novelName = $(this).find("a").text();
        let novelCover = $(this).find("img").attr("src");
        novelCover = novelCover.includes("https://tva1.sinaimg.cn/")
            ? `${novelCover}`
            : `${baseUrl}${novelCover}`;

        const novel = {
            extensionId: 52,
            novelUrl,
            novelName,
            novelCover,
        };

        novels.push(novel);
    });

    return novels;
};

const YushuboScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default YushuboScraper;
